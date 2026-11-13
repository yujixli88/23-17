"""SQLite storage layer shared by the web app and the admin panel."""

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.environ.get("GAME_DATABASE_PATH", BASE_DIR / "data" / "game.sqlite3")
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
        }
        for column, statement in migrations.items():
            if column not in user_columns:
                connection.execute(statement)

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
