import hmac
import os
import sqlite3
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import auth
from game_logic import accuse, check_challenge_answer, get_challenge, start_game


app = FastAPI(title="The Last Chime")
BASE_DIR = Path(__file__).resolve().parent
SESSION_COOKIE = "last_chime_session"
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_ATTEMPTS = 5
login_attempts = defaultdict(deque)


class RegisterPayload(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=12, max_length=128)


class LoginPayload(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class AnswerPayload(BaseModel):
    answer: str = Field(min_length=1, max_length=100)


def get_current_session(request: Request) -> dict:
    session = auth.get_session(request.cookies.get(SESSION_COOKIE))
    if not session:
        raise HTTPException(
            status_code=401,
            detail={"code": "authentication_required", "message": "Please sign in."},
        )
    return session


def require_csrf(request: Request, session: dict) -> None:
    supplied_token = request.headers.get("X-CSRF-Token", "")
    if not hmac.compare_digest(supplied_token, session["csrf_token"]):
        raise HTTPException(
            status_code=403,
            detail={"code": "csrf_failed", "message": "Request verification failed."},
        )


def set_session_cookie(response: Response, cookie_value: str) -> None:
    secure_cookie = (
        os.environ.get("GAME_COOKIE_SECURE", "").casefold() in {"1", "true", "yes"}
    )
    response.set_cookie(
        key=SESSION_COOKIE,
        value=cookie_value,
        max_age=auth.SESSION_LIFETIME,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        path="/",
    )


def enforce_login_limit(request: Request) -> deque:
    now = time.monotonic()
    client_ip = request.client.host if request.client else "unknown"
    attempts = login_attempts[client_ip]
    while attempts and now - attempts[0] >= LOGIN_WINDOW_SECONDS:
        attempts.popleft()
    if len(attempts) >= LOGIN_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail={"code": "login_rate_limited", "message": "Try again later."},
            headers={"Retry-After": str(LOGIN_WINDOW_SECONDS)},
        )
    return attempts


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(BASE_DIR / "game.html")


@app.get("/game", include_in_schema=False)
def game_page():
    return FileResponse(BASE_DIR / "game.html")


@app.get("/game.css", include_in_schema=False)
def game_styles():
    return FileResponse(BASE_DIR / "game.css", media_type="text/css")


@app.get("/api/auth/email-availability")
def check_email_availability(email: str, request: Request):
    ip = request.client.host if request.client else "unknown"
    attempts = login_attempts[f"email:{ip}"]
    now = time.monotonic()
    while attempts and now - attempts[0] >= 60:
        attempts.popleft()
    if len(attempts) >= 30:
        raise HTTPException(status_code=429, detail="Please wait before checking again.")
    attempts.append(now)

    normalized_email = auth.normalize_email(email)
    if not auth.valid_email(normalized_email):
        return {"valid": False, "available": False, "code": "invalid_email"}
    return {"valid": True, "available": auth.email_availability(normalized_email)}


@app.post("/api/auth/register")
def register(payload: RegisterPayload, response: Response):
    try:
        username, email = auth.validate_registration(
            payload.username, payload.email, payload.password
        )
    except ValueError as error:
        code = str(error)
        messages = {
            "username": "Use 3–32 English letters, numbers, dots, underscores, or dashes.",
            "email": "Enter a valid email address.",
            "password": "Password must be between 12 and 128 characters.",
        }
        raise HTTPException(
            status_code=422, detail={"code": code, "message": messages[code]}
        ) from error

    try:
        user = auth.create_user(username, email, payload.password)
    except sqlite3.IntegrityError as error:
        if not auth.email_availability(email):
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "email_taken",
                    "message": "This email is already registered.",
                },
            ) from error
        raise HTTPException(
            status_code=409,
            detail={"code": "username_taken", "message": "This username is already in use."},
        ) from error

    cookie_value, csrf_token = auth.create_session(user["id"])
    set_session_cookie(response, cookie_value)
    return {"authenticated": True, "user": user, "csrf_token": csrf_token}


@app.post("/api/auth/login")
def login(payload: LoginPayload, request: Request, response: Response):
    attempts = enforce_login_limit(request)
    user = auth.authenticate_user(payload.email, payload.password)
    if not user:
        attempts.append(time.monotonic())
        raise HTTPException(
            status_code=401,
            detail={
                "code": "invalid_credentials",
                "message": "Email or password is incorrect.",
            },
        )
    attempts.clear()
    cookie_value, csrf_token = auth.create_session(user["id"])
    set_session_cookie(response, cookie_value)
    return {"authenticated": True, "user": user, "csrf_token": csrf_token}


@app.get("/api/auth/me")
def current_user(request: Request):
    session = auth.get_session(request.cookies.get(SESSION_COOKIE))
    if not session:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "user": session["user"],
        "csrf_token": session["csrf_token"],
    }


@app.post("/api/auth/logout")
def logout(
    request: Request,
    response: Response,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)
    auth.delete_session(session["session_hash"])
    response.delete_cookie(
        SESSION_COOKIE, path="/", httponly=True, samesite="lax"
    )
    return {"authenticated": False}


@app.get("/api/game")
def get_game(session: dict = Depends(get_current_session)):
    game = start_game()
    game["progress"] = auth.get_progress(session["user"]["id"])
    return game


@app.post("/api/game/restart")
def restart_game(
    request: Request,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)
    return auth.reset_progress(session["user"]["id"])


@app.post("/api/game/clues/{clue_id}")
def record_clue(
    clue_id: int,
    request: Request,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)
    game = start_game()
    if clue_id < 0 or clue_id >= len(game["clues"]):
        raise HTTPException(status_code=404, detail="Clue not found.")
    return auth.save_clue(session["user"]["id"], clue_id)


@app.get("/api/game/challenge")
def current_challenge(session: dict = Depends(get_current_session)):
    progress = auth.get_progress(session["user"]["id"])
    challenge = get_challenge(progress["stage"])
    return challenge or {"stage": progress["stage"], "complete": True}


@app.post("/api/game/answer")
def submit_answer(
    payload: AnswerPayload,
    request: Request,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)
    user_id = session["user"]["id"]
    progress = auth.get_progress(user_id)

    challenge = get_challenge(progress["stage"])
    if not challenge:
        return {"correct": True, "progress": progress, "complete": True}

    correct = check_challenge_answer(progress["stage"], payload.answer)
    if correct:
        progress = auth.advance_stage(user_id, progress["stage"])
    return {"correct": correct, "progress": progress}


@app.post("/api/accuse/{suspect_id}")
def accuse_player(
    suspect_id: str,
    request: Request,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)
    user_id = session["user"]["id"]
    progress = auth.get_progress(user_id)
    if progress["stage"] < 2:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "challenges_required",
                "message": "Complete the case challenges first.",
            },
        )
    verdict = accuse(suspect_id)
    if verdict["correct"]:
        verdict["progress"] = auth.complete_game(user_id)
    return verdict
