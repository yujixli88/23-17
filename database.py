"""SQLite storage layer shared by the web app and the admin panel."""

import os
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.environ.get("GAME_DATABASE_PATH", BASE_DIR / "game.db")
)


@contextmanager
def connect(database_path: Path | None = None) -> Iterator[sqlite3.Connection]:
    """Open the application database and close it after the operation."""
    path = database_path or DATABASE_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database(database_path: Path | None = None) -> None:
    """Create the schema and add columns needed by older databases."""
    with connect(database_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL COLLATE NOCASE UNIQUE,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                english_level TEXT NOT NULL DEFAULT 'B2',
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                hashed_password TEXT NOT NULL DEFAULT '',
                created_at INTEGER NOT NULL,
                last_active_at INTEGER NOT NULL DEFAULT 0,
                banned_until INTEGER NOT NULL DEFAULT 0,
                ban_reason TEXT NOT NULL DEFAULT ''
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
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                display_name TEXT NOT NULL,
                date_of_birth TEXT,
                phone TEXT,
                avatar_data TEXT,
                avatar_mime_type TEXT
            );
            """
        )

        user_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(users)")
        }
        migrations = {
            "english_level":
                "ALTER TABLE users ADD COLUMN english_level TEXT NOT NULL DEFAULT 'B2'",
            "last_active_at":
                "ALTER TABLE users ADD COLUMN last_active_at INTEGER NOT NULL DEFAULT 0",
            "banned_until":
                "ALTER TABLE users ADD COLUMN banned_until INTEGER NOT NULL DEFAULT 0",
            "ban_reason":
                "ALTER TABLE users ADD COLUMN ban_reason TEXT NOT NULL DEFAULT ''",
            "username":
                "ALTER TABLE users ADD COLUMN username TEXT",
            "password_salt":
                "ALTER TABLE users ADD COLUMN password_salt TEXT NOT NULL DEFAULT ''",
            "password_hash":
                "ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''",
            "hashed_password":
                "ALTER TABLE users ADD COLUMN hashed_password TEXT NOT NULL DEFAULT ''",
            "created_at":
                "ALTER TABLE users ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0",
        }
        for column, statement in migrations.items():
            if column not in user_columns:
                connection.execute(statement)

        profile_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(user_profiles)")
        }
        profile_migrations = {
            "display_name":
                "ALTER TABLE user_profiles ADD COLUMN display_name TEXT NOT NULL DEFAULT ''",
            "date_of_birth":
                "ALTER TABLE user_profiles ADD COLUMN date_of_birth TEXT",
            "phone":
                "ALTER TABLE user_profiles ADD COLUMN phone TEXT",
            "avatar_data":
                "ALTER TABLE user_profiles ADD COLUMN avatar_data TEXT",
            "avatar_mime_type":
                "ALTER TABLE user_profiles ADD COLUMN avatar_mime_type TEXT",
        }
        for column, statement in profile_migrations.items():
            if column not in profile_columns:
                connection.execute(statement)

        used_usernames = {
            row["username"].casefold()
            for row in connection.execute(
                "SELECT username FROM users WHERE username IS NOT NULL AND username != ''"
            )
        }
        for user in connection.execute(
            "SELECT id, email, username FROM users ORDER BY id"
        ):
            if user["username"]:
                continue
            profile = connection.execute(
                "SELECT display_name FROM user_profiles WHERE user_id = ?",
                (user["id"],),
            ).fetchone()
            preferred_name = (
                profile["display_name"]
                if profile and profile["display_name"]
                else (user["email"] or "").split("@", 1)[0]
            )
            username = re.sub(r"[^\w.-]", "", preferred_name)[:32]
            if len(username) < 3:
                username = f"player{user['id']}"
            base_username = username
            suffix_number = 1
            while username.casefold() in used_usernames:
                suffix = f"-{user['id']}-{suffix_number}"
                username = f"{base_username[:32 - len(suffix)]}{suffix}"
                suffix_number += 1
            connection.execute(
                "UPDATE users SET username = ? WHERE id = ?",
                (username, user["id"]),
            )
            used_usernames.add(username.casefold())

        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique "
            "ON users(username COLLATE NOCASE)"
        )
        connection.execute(
            """
            INSERT OR IGNORE INTO user_profiles (user_id, display_name)
            SELECT id, username FROM users
            """
        )
        connection.execute(
            """
            INSERT OR IGNORE INTO game_progress (user_id)
            SELECT id FROM users
            """
        )
        connection.execute(
            """
            UPDATE users
            SET created_at = CAST(strftime('%s', 'now') AS INTEGER)
            WHERE created_at = 0
            """
        )
        # Older versions of the admin panel could delete a user while SQLite
        # foreign-key enforcement was disabled, leaving orphaned child rows.
        connection.execute(
            "DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users)"
        )
        connection.execute(
            "DELETE FROM game_progress WHERE user_id NOT IN (SELECT id FROM users)"
        )
        connection.execute(
            "UPDATE users SET last_active_at = created_at WHERE last_active_at = 0"
        )
