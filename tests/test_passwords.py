import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

_bootstrap = tempfile.TemporaryDirectory()
_previous_database_path = os.environ.get("GAME_DATABASE_PATH")
os.environ["GAME_DATABASE_PATH"] = str(Path(_bootstrap.name) / "bootstrap.sqlite3")

import auth
import database
from password_utils import hash_password

if _previous_database_path is None:
    os.environ.pop("GAME_DATABASE_PATH", None)
else:
    os.environ["GAME_DATABASE_PATH"] = _previous_database_path


class AuthDatabaseTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temporary_directory.name) / "game.sqlite3"
        self.database_patch = patch.object(auth, "DATABASE_PATH", self.database_path)
        self.database_patch.start()
        auth.initialize_database()

    def tearDown(self):
        self.database_patch.stop()
        self.temporary_directory.cleanup()

    def test_registration_requires_matching_password_character_classes(self):
        accepted = "Aa1!xxxxxx"
        self.assertEqual(
            auth.validate_registration(
                "detective_17", "detective@example.com", accepted
            )[0],
            "detective_17",
        )
        self.assertTrue(auth.valid_password("Aa1!" + "é" * 34))

        rejected = (
            "Aa1!short",
            "ABCDEFGHIJ1!",
            "abcdefghij1!",
            "Abcdefghij!",
            "Abcdefghij1",
            "Aa1!" + "é" * 35,
            "A1!" + "a" * 70,
        )
        for password in rejected:
            with self.subTest(password=password):
                with self.assertRaisesRegex(ValueError, "password"):
                    auth.validate_registration(
                        "detective_17",
                        "detective@example.com",
                        password,
                    )

    def test_registration_hashes_password_and_authenticates_email_or_username(self):
        password = "DetectivePassword42!"
        user = auth.create_user(
            "detective_17", "PLAYER@example.com", password, "B2"
        )

        self.assertEqual(user["email"], "player@example.com")
        self.assertEqual(user["username"], "detective_17")
        self.assertEqual(
            auth.authenticate_user("PLAYER@example.com", password)["id"],
            user["id"],
        )
        self.assertEqual(
            auth.authenticate_user("detective_17", password)["id"],
            user["id"],
        )
        self.assertIsNone(auth.authenticate_user("detective_17", "wrong-password"))

        with database.connect(self.database_path) as connection:
            row = connection.execute(
                "SELECT password_salt, password_hash, hashed_password FROM users"
            ).fetchone()
        self.assertTrue(row["password_salt"])
        self.assertTrue(row["password_hash"])
        self.assertEqual(row["hashed_password"], "")
        self.assertNotIn(password, row["password_hash"])

    def test_legacy_account_keeps_profile_and_upgrades_password_hash_on_login(self):
        legacy_path = Path(self.temporary_directory.name) / "legacy.sqlite3"
        legacy_password = "LegacyDetective42!"
        with sqlite3.connect(legacy_path) as connection:
            connection.executescript(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    hashed_password TEXT NOT NULL,
                    glitters INTEGER NOT NULL DEFAULT 0,
                    rank_level TEXT NOT NULL
                );
                CREATE TABLE user_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
                    display_name TEXT NOT NULL,
                    date_of_birth TEXT,
                    phone TEXT,
                    avatar_data TEXT
                );
                """
            )
            connection.execute(
                """
                INSERT INTO users (email, hashed_password, glitters, rank_level)
                VALUES (?, ?, ?, ?)
                """,
                (
                    "legacy@example.com",
                    hash_password(legacy_password),
                    17,
                    "Gold",
                ),
            )
            connection.execute(
                """
                INSERT INTO user_profiles (user_id, display_name, phone)
                VALUES (1, 'Old Detective', '+1 555 123 4567')
                """
            )
        connection.close()

        with patch.object(auth, "DATABASE_PATH", legacy_path):
            auth.initialize_database()
            migrated_user = auth.authenticate_user(
                "legacy@example.com", legacy_password
            )
            self.assertEqual(migrated_user["display_name"], "Old Detective")
            self.assertEqual(migrated_user["phone"], "+1 555 123 4567")
            self.assertEqual(migrated_user["username"], "OldDetective")

            with database.connect(legacy_path) as connection:
                row = connection.execute(
                    """
                    SELECT password_salt, password_hash, hashed_password,
                           glitters, rank_level
                    FROM users WHERE id = 1
                    """
                ).fetchone()
                progress = connection.execute(
                    "SELECT stage, clues_json FROM game_progress WHERE user_id = 1"
                ).fetchone()
            self.assertTrue(row["password_salt"])
            self.assertTrue(row["password_hash"])
            self.assertEqual(row["hashed_password"], "")
            self.assertEqual(row["glitters"], 17)
            self.assertEqual(row["rank_level"], "Gold")
            self.assertEqual(progress["stage"], 0)
            self.assertEqual(progress["clues_json"], "[]")

            created_user = auth.create_user(
                "new_player",
                "new@example.com",
                "AnotherPassword42!",
            )
            self.assertEqual(created_user["username"], "new_player")
            with database.connect(legacy_path) as connection:
                new_row = connection.execute(
                    """
                    SELECT hashed_password, glitters, rank_level
                    FROM users WHERE id = ?
                    """,
                    (created_user["id"],),
                ).fetchone()
            self.assertEqual(new_row["hashed_password"], "")
            self.assertEqual(new_row["glitters"], 0)
            self.assertEqual(new_row["rank_level"], "Базовый уровень")

            with database.connect(legacy_path) as connection:
                connection.execute(
                    "UPDATE game_progress SET stage = 1 WHERE user_id = 1"
                )
            auth.initialize_database()
            with database.connect(legacy_path) as connection:
                profile_count = connection.execute(
                    "SELECT COUNT(*) FROM user_profiles WHERE user_id = 1"
                ).fetchone()[0]
                saved_stage = connection.execute(
                    "SELECT stage FROM game_progress WHERE user_id = 1"
                ).fetchone()[0]
            self.assertEqual(profile_count, 1)
            self.assertEqual(saved_stage, 1)


if __name__ == "__main__":
    unittest.main()
