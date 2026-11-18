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

import database
from password_utils import verify_password as verify_legacy_password


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = database.DATABASE_PATH
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
    with database.connect(DATABASE_PATH) as connection:
        yield connection


def initialize_database() -> None:
    database.initialize_database(DATABASE_PATH)


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


def validate_registration(
    username: str,
    email: str,
    password: str,
    english_level: str = "B2",
) -> tuple[str, str, str]:
    username = username.strip()
    email = normalize_email(email)
    if not re.fullmatch(r"[\w.-]{3,32}", username):
        raise ValueError("username")
    if not valid_email(email):
        raise ValueError("email")
    if len(password) < 12 or len(password) > 128:
        raise ValueError("password")
    if english_level not in {"A1", "A2", "B1", "B2", "C1", "C2"}:
        raise ValueError("english_level")
    return username, email, english_level


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


def _user_payload(connection: sqlite3.Connection, user: sqlite3.Row) -> dict:
    profile = connection.execute(
        "SELECT * FROM user_profiles WHERE user_id = ?", (user["id"],)
    ).fetchone()
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "english_level": user["english_level"],
        "display_name": (
            profile["display_name"]
            if profile and profile["display_name"]
            else user["username"]
        ),
        "date_of_birth": profile["date_of_birth"] if profile else None,
        "phone": profile["phone"] if profile else None,
        "avatar_data": profile["avatar_data"] if profile else None,
        "avatar_mime_type": profile["avatar_mime_type"] if profile else None,
    }


def create_user(
    username: str,
    email: str,
    password: str,
    english_level: str = "B2",
) -> dict:
    username, email, english_level = validate_registration(
        username, email, password, english_level
    )
    now = int(time.time())
    salt = secrets.token_bytes(16)
    password_hash = _hash_password(password, salt).hex()
    with connect() as connection:
        columns = [
            "username",
            "email",
            "english_level",
            "password_salt",
            "password_hash",
            "hashed_password",
            "created_at",
            "last_active_at",
        ]
        values = [
            username,
            email,
            english_level,
            salt.hex(),
            password_hash,
            "",
            now,
            now,
        ]
        existing_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(users)")
        }
        for column, value in (
            ("glitters", 0),
            ("rank_level", "Базовый уровень"),
        ):
            if column in existing_columns:
                columns.append(column)
                values.append(value)
        cursor = connection.execute(
            f"INSERT INTO users ({', '.join(columns)}) "
            f"VALUES ({', '.join('?' for _ in columns)})",
            values,
        )
        # A legacy database may contain progress for a previously deleted user
        # whose numeric id is reused by SQLite for this new account.
        connection.execute(
            "DELETE FROM game_progress WHERE user_id = ?", (cursor.lastrowid,)
        )
        connection.execute(
            "INSERT INTO game_progress (user_id) VALUES (?)", (cursor.lastrowid,)
        )
        connection.execute(
            "INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)",
            (cursor.lastrowid, username),
        )
        user = connection.execute(
            "SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _user_payload(connection, user)


def authenticate_user(identifier: str, password: str) -> dict | None:
    """Authenticate by either the user's email address or username."""
    normalized_identifier = normalize_email(identifier)
    with connect() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            (normalized_identifier, normalized_identifier),
        ).fetchone()

        if not user:
            _hash_password(password, bytes(16))
            return None

        salt_hex = user["password_salt"] or ""
        hash_hex = user["password_hash"] or ""
        verified = False
        if salt_hex and hash_hex:
            try:
                actual = _hash_password(password, bytes.fromhex(salt_hex))
                verified = hmac.compare_digest(actual, bytes.fromhex(hash_hex))
            except ValueError:
                verified = False

        if not verified and user["hashed_password"]:
            verified = verify_legacy_password(password, user["hashed_password"])
            if verified:
                salt = secrets.token_bytes(16)
                password_hash = _hash_password(password, salt).hex()
                connection.execute(
                    """
                    UPDATE users
                    SET password_salt = ?, password_hash = ?, hashed_password = ''
                    WHERE id = ?
                    """,
                    (salt.hex(), password_hash, user["id"]),
                )
                user = connection.execute(
                    "SELECT * FROM users WHERE id = ?", (user["id"],)
                ).fetchone()

        if not verified:
            return None
        return _user_payload(connection, user)


def is_user_banned(user_id: int) -> bool:
    with connect() as connection:
        row = connection.execute(
            "SELECT banned_until FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    return bool(row and row["banned_until"] > int(time.time()))


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
        connection.execute(
            "UPDATE users SET last_active_at = ? WHERE id = ?",
            (int(time.time()), user_id),
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
            SELECT users.id, users.username, users.email, users.english_level,
                   user_profiles.display_name, user_profiles.date_of_birth,
                   user_profiles.phone, user_profiles.avatar_data,
                   user_profiles.avatar_mime_type, sessions.csrf_token,
                   sessions.expires_at, sessions.session_hash
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            LEFT JOIN user_profiles ON user_profiles.user_id = users.id
            WHERE sessions.session_hash = ?
            """,
            (session_hash,),
        ).fetchone()
        if row and row["expires_at"] <= int(time.time()):
            connection.execute(
                "DELETE FROM sessions WHERE session_hash = ?", (session_hash,)
            )
            return None
        if row:
            connection.execute(
                "UPDATE users SET last_active_at = ? WHERE id = ?",
                (int(time.time()), row["id"]),
            )
    if not row:
        return None
    return {
        "user": {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
            "english_level": row["english_level"],
            "display_name": row["display_name"] or row["username"],
            "date_of_birth": row["date_of_birth"],
            "phone": row["phone"],
            "avatar_data": row["avatar_data"],
            "avatar_mime_type": row["avatar_mime_type"],
        },
        "csrf_token": row["csrf_token"],
        "session_hash": row["session_hash"],
    }


def update_profile(
    user_id: int,
    display_name: str,
    date_of_birth: str | None,
    phone: str | None,
    avatar_data: str | None,
    avatar_mime_type: str | None,
    remove_avatar: bool = False,
) -> dict:
    with connect() as connection:
        profile = connection.execute(
            "SELECT 1 FROM user_profiles WHERE user_id = ?", (user_id,)
        ).fetchone()
        if profile:
            if remove_avatar:
                connection.execute(
                    """
                    UPDATE user_profiles
                    SET display_name = ?, date_of_birth = ?, phone = ?,
                        avatar_data = NULL, avatar_mime_type = NULL
                    WHERE user_id = ?
                    """,
                    (display_name, date_of_birth, phone, user_id),
                )
            elif avatar_data is not None:
                connection.execute(
                    """
                    UPDATE user_profiles
                    SET display_name = ?, date_of_birth = ?, phone = ?,
                        avatar_data = ?, avatar_mime_type = ?
                    WHERE user_id = ?
                    """,
                    (
                        display_name,
                        date_of_birth,
                        phone,
                        avatar_data,
                        avatar_mime_type,
                        user_id,
                    ),
                )
            else:
                connection.execute(
                    """
                    UPDATE user_profiles
                    SET display_name = ?, date_of_birth = ?, phone = ?
                    WHERE user_id = ?
                    """,
                    (display_name, date_of_birth, phone, user_id),
                )
        else:
            connection.execute(
                """
                INSERT INTO user_profiles (
                    user_id, display_name, date_of_birth, phone,
                    avatar_data, avatar_mime_type
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    display_name,
                    date_of_birth,
                    phone,
                    None if remove_avatar else avatar_data,
                    None if remove_avatar else avatar_mime_type,
                ),
            )

        user = connection.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if not user:
            raise LookupError("User no longer exists.")
        return _user_payload(connection, user)


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
