import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.environ.get("GAME_DATABASE_PATH", BASE_DIR / "data" / "game.sqlite3")
)
PASSWORD_ITERATIONS = 600_000
SESSION_LIFETIME = 60 * 60 * 24 * 7


def _load_session_secret() -> bytes:
    configured_secret = os.environ.get("GAME_SESSION_SECRET")
    if configured_secret:
        if len(configured_secret.encode("utf-8")) < 32:
            raise RuntimeError("GAME_SESSION_SECRET must contain at least 32 bytes.")
        return configured_secret.encode("utf-8")

    secret_path = Path.home() / ".last_chime" / "session.key"
    secret_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with secret_path.open("xb") as secret_file:
            secret_file.write(secrets.token_bytes(48))
    except FileExistsError:
        pass
    return secret_path.read_bytes()


SESSION_SECRET = _load_session_secret()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL COLLATE NOCASE UNIQUE,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                session_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                csrf_token TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS game_progress (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                stage INTEGER NOT NULL DEFAULT 0,
                clues_json TEXT NOT NULL DEFAULT '[]',
                completed INTEGER NOT NULL DEFAULT 0
            );
            """
        )


def normalize_email(email: str) -> str:
    return email.strip().casefold()


def valid_email(email: str) -> bool:
    if len(email) > 254:
        return False
    return bool(
        re.fullmatch(
            r"[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?"
            r"(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+",
            email,
            re.IGNORECASE,
        )
    )


def validate_registration(username: str, email: str, password: str) -> tuple[str, str]:
    username = username.strip()
    email = normalize_email(email)
    if not re.fullmatch(r"[\w.-]{3,32}", username):
        raise ValueError("username")
    if not valid_email(email):
        raise ValueError("email")
    if len(password) < 12 or len(password) > 128:
        raise ValueError("password")
    return username, email


def email_availability(email: str) -> bool:
    normalized_email = normalize_email(email)
    if not valid_email(normalized_email):
        return False
    with connect() as connection:
        user = connection.execute(
            "SELECT 1 FROM users WHERE email = ?", (normalized_email,)
        ).fetchone()
    return user is None


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )


def create_user(username: str, email: str, password: str) -> dict:
    username, email = validate_registration(username, email, password)
    salt = secrets.token_bytes(16)
    password_hash = _hash_password(password, salt).hex()
    with connect() as connection:
        cursor = connection.execute(
            """
            INSERT INTO users (username, email, password_salt, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (username, email, salt.hex(), password_hash, int(time.time())),
        )
        connection.execute(
            "INSERT INTO game_progress (user_id) VALUES (?)", (cursor.lastrowid,)
        )
        return {
            "id": cursor.lastrowid,
            "username": username,
            "email": email,
        }


def authenticate_user(email: str, password: str) -> dict | None:
    normalized_email = normalize_email(email)
    with connect() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?", (normalized_email,)
        ).fetchone()

    salt = bytes.fromhex(user["password_salt"]) if user else bytes(16)
    expected = bytes.fromhex(user["password_hash"]) if user else bytes(32)
    actual = _hash_password(password, salt)
    if not user or not hmac.compare_digest(actual, expected):
        return None
    return {"id": user["id"], "username": user["username"], "email": user["email"]}


def create_session(user_id: int) -> tuple[str, str]:
    session_id = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    expires_at = int(time.time()) + SESSION_LIFETIME
    session_hash = hashlib.sha256(session_id.encode("ascii")).hexdigest()
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO sessions (session_hash, user_id, csrf_token, expires_at)
            VALUES (?, ?, ?, ?)
            """,
            (session_hash, user_id, csrf_token, expires_at),
        )
    signature = hmac.new(
        SESSION_SECRET, session_id.encode("ascii"), hashlib.sha256
    ).hexdigest()
    return f"{session_id}.{signature}", csrf_token


def get_session(cookie_value: str | None) -> dict | None:
    if not cookie_value or "." not in cookie_value:
        return None
    session_id, signature = cookie_value.rsplit(".", 1)
    expected_signature = hmac.new(
        SESSION_SECRET, session_id.encode("ascii"), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        return None

    session_hash = hashlib.sha256(session_id.encode("ascii")).hexdigest()
    with connect() as connection:
        row = connection.execute(
            """
            SELECT users.id, users.username, users.email, sessions.csrf_token,
                   sessions.expires_at, sessions.session_hash
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.session_hash = ?
            """,
            (session_hash,),
        ).fetchone()
        if row and row["expires_at"] <= int(time.time()):
            connection.execute(
                "DELETE FROM sessions WHERE session_hash = ?", (session_hash,)
            )
            return None
    if not row:
        return None
    return {
        "user": {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
        },
        "csrf_token": row["csrf_token"],
        "session_hash": row["session_hash"],
    }


def delete_session(session_hash: str) -> None:
    with connect() as connection:
        connection.execute(
            "DELETE FROM sessions WHERE session_hash = ?", (session_hash,)
        )


def get_progress(user_id: int) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT stage, clues_json, completed FROM game_progress WHERE user_id = ?",
            (user_id,),
        ).fetchone()
    if not row:
        raise LookupError("Game progress was not initialized for this user.")
    return {
        "stage": row["stage"],
        "clues": json.loads(row["clues_json"]),
        "completed": bool(row["completed"]),
    }


def save_clue(user_id: int, clue_id: int) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT clues_json FROM game_progress WHERE user_id = ?", (user_id,)
        ).fetchone()
        if not row:
            raise LookupError("Game progress was not initialized for this user.")
        clues = set(json.loads(row["clues_json"]))
        clues.add(clue_id)
        connection.execute(
            "UPDATE game_progress SET clues_json = ? WHERE user_id = ?",
            (json.dumps(sorted(clues)), user_id),
        )
    return get_progress(user_id)


def advance_stage(user_id: int, expected_stage: int) -> dict:
    with connect() as connection:
        row = connection.execute(
            "SELECT stage FROM game_progress WHERE user_id = ?", (user_id,)
        ).fetchone()
        if not row:
            raise LookupError("Game progress was not initialized for this user.")
        if row["stage"] == expected_stage:
            connection.execute(
                "UPDATE game_progress SET stage = stage + 1 WHERE user_id = ?",
                (user_id,),
            )
    return get_progress(user_id)


def complete_game(user_id: int) -> dict:
    with connect() as connection:
        connection.execute(
            "UPDATE game_progress SET completed = 1 WHERE user_id = ?", (user_id,)
        )
    return get_progress(user_id)


def reset_progress(user_id: int) -> dict:
    with connect() as connection:
        connection.execute(
            """
            UPDATE game_progress
            SET stage = 0, clues_json = '[]', completed = 0
            WHERE user_id = ?
            """,
            (user_id,),
        )
    return get_progress(user_id)


initialize_database()
