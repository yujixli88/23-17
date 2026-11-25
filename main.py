import base64
import binascii
import hmac
import os
import re
import sqlite3
import time
from collections import defaultdict, deque
from datetime import date
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import auth
from game_logic import accuse, check_challenge_answer, get_challenge, start_game
from vocabulary import get_vocabulary_exercises, get_vocabulary_games


app = FastAPI(title="The Last Chime")
BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
SESSION_COOKIE = "last_chime_session"
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_ATTEMPTS = 5
login_attempts = defaultdict(deque)


class RegisterPayload(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    english_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = "B2"


class LoginPayload(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class AnswerPayload(BaseModel):
    answer: str = Field(min_length=1, max_length=100)


class ProfilePayload(BaseModel):
    display_name: str = Field(min_length=1, max_length=32)
    date_of_birth: str | None = None
    phone: str | None = Field(default=None, max_length=32)
    avatar_data: str | None = Field(default=None, max_length=2_800_000)
    remove_avatar: bool = False


def get_current_session(request: Request) -> dict:
    session = auth.get_session(request.cookies.get(SESSION_COOKIE))
    if not session:
        raise HTTPException(
            status_code=401,
            detail={"code": "authentication_required", "message": "Please sign in."},
        )
    if auth.is_user_banned(session["user"]["id"]):
        auth.delete_session(session["session_hash"])
        raise HTTPException(
            status_code=403,
            detail={"code": "user_banned", "message": "This account is banned."},
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
        retry_after = max(1, int(LOGIN_WINDOW_SECONDS - (now - attempts[0])))
        raise HTTPException(
            status_code=429,
            detail={
                "code": "login_rate_limited",
                "message": "Too many login attempts. Try again later.",
            },
            headers={"Retry-After": str(retry_after)},
        )
    return attempts


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(BASE_DIR / "game.html")


@app.get("/game", include_in_schema=False)
@app.get("/menu", include_in_schema=False)
@app.get("/login", include_in_schema=False)
@app.get("/play", include_in_schema=False)
def game_page():
    return FileResponse(BASE_DIR / "game.html")


@app.get("/game.css", include_in_schema=False)
def game_styles():
    return FileResponse(BASE_DIR / "game.css", media_type="text/css")


@app.get("/game.js", include_in_schema=False)
def game_script():
    return FileResponse(BASE_DIR / "game.js", media_type="text/javascript")


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
        username, email, english_level = auth.validate_registration(
            payload.username,
            payload.email,
            payload.password,
            payload.english_level,
        )
    except ValueError as error:
        code = str(error)
        messages = {
            "username": "Use 3–32 English letters, numbers, dots, underscores, or dashes.",
            "email": "Enter a valid email address.",
            "password": (
                "Use 10-128 characters with a lowercase letter, an uppercase "
                "letter, a number, and a symbol."
            ),
            "english_level": "Choose a valid English level.",
        }
        raise HTTPException(
            status_code=422, detail={"code": code, "message": messages[code]}
        ) from error

    try:
        user = auth.create_user(
            username, email, payload.password, english_level
        )
    except sqlite3.IntegrityError as error:
        error_text = str(error).casefold()
        if "users.email" in error_text:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "email_taken",
                    "message": "This email is already registered.",
                },
            ) from error
        if "users.username" in error_text:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "username_taken",
                    "message": "This username is already in use.",
                },
            ) from error
        raise HTTPException(
            status_code=409,
            detail={
                "code": "database_conflict",
                "message": "The account could not be created. Please try again.",
            },
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
    if auth.is_user_banned(user["id"]):
        attempts.clear()
        raise HTTPException(
            status_code=403,
            detail={"code": "user_banned", "message": "This account is banned."},
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


@app.post("/api/auth/profile")
def save_profile(
    payload: ProfilePayload,
    request: Request,
    session: dict = Depends(get_current_session),
):
    require_csrf(request, session)

    display_name = payload.display_name.strip()
    if not display_name or not display_name.isprintable():
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_profile", "message": "Enter a valid display name."},
        )

    date_of_birth = None
    if payload.date_of_birth:
        try:
            parsed_date = date.fromisoformat(payload.date_of_birth)
        except ValueError as error:
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "invalid_profile",
                    "message": "Enter a valid date of birth.",
                },
            ) from error
        if parsed_date > date.today():
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "invalid_profile",
                    "message": "Date of birth cannot be in the future.",
                },
            )
        date_of_birth = parsed_date.isoformat()

    phone = (payload.phone or "").strip() or None
    if phone and not re.fullmatch(r"\+?[0-9\s().-]{7,32}", phone):
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_profile", "message": "Enter a valid phone number."},
        )

    avatar_data = None
    avatar_mime_type = None
    if payload.avatar_data is not None:
        header, separator, encoded_image = payload.avatar_data.partition(",")
        allowed_types = {
            "data:image/png;base64": (b"\x89PNG\r\n\x1a\n",),
            "data:image/jpeg;base64": (b"\xff\xd8\xff",),
            "data:image/gif;base64": (b"GIF87a", b"GIF89a"),
            "data:image/webp;base64": (b"RIFF",),
        }
        signatures = allowed_types.get(header)
        if not separator or not signatures:
            raise HTTPException(
                status_code=422,
                detail={"code": "invalid_avatar", "message": "Unsupported image format."},
            )
        try:
            image_bytes = base64.b64decode(encoded_image, validate=True)
        except (binascii.Error, ValueError) as error:
            raise HTTPException(
                status_code=422,
                detail={"code": "invalid_avatar", "message": "Invalid image data."},
            ) from error
        is_valid_signature = any(
            image_bytes.startswith(signature) for signature in signatures
        )
        if (
            not is_valid_signature
            or len(image_bytes) > 2 * 1024 * 1024
            or (
                header == "data:image/webp;base64"
                and image_bytes[8:12] != b"WEBP"
            )
        ):
            raise HTTPException(
                status_code=422,
                detail={
                    "code": "invalid_avatar",
                    "message": "Choose a valid image no larger than 2 MB.",
                },
            )
        avatar_data = encoded_image
        avatar_mime_type = header[5:-7]

    try:
        return auth.update_profile(
            session["user"]["id"],
            display_name,
            date_of_birth,
            phone,
            avatar_data,
            avatar_mime_type,
            payload.remove_avatar,
        )
    except LookupError as error:
        raise HTTPException(
            status_code=404, detail="The account no longer exists."
        ) from error


@app.get("/api/game")
def get_game(session: dict = Depends(get_current_session)):
    game = start_game()
    game["progress"] = auth.get_progress(session["user"]["id"])
    return game


@app.get("/api/game/vocabulary")
def get_vocabulary(session: dict = Depends(get_current_session)):
    return {
        "exercises": get_vocabulary_exercises(),
        "games": get_vocabulary_games(),
    }


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
