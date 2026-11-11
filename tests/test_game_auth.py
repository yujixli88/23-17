import tempfile
import sqlite3
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import auth
import admin_app
import main


class AuthenticationAndProgressTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_patch = patch.object(
            auth, "DATABASE_PATH", Path(self.temp_dir.name) / "test.sqlite3"
        )
        self.database_patch.start()
        auth.initialize_database()
        main.login_attempts.clear()
        self.client = TestClient(main.app)

    def tearDown(self):
        self.client.close()
        self.database_patch.stop()
        self.temp_dir.cleanup()

    def register(self, email="detective@example.com", english_level="B2"):
        return self.client.post(
            "/api/auth/register",
            json={
                "username": "CaseSolver",
                "email": email,
                "password": "a-long-test-password",
                "english_level": english_level,
            },
        )

    def test_game_page_loads_external_javascript(self):
        page = self.client.get("/")
        script = self.client.get("/game.js?v=17")

        self.assertEqual(page.status_code, 200)
        self.assertIn('<script src="/game.js?v=17" defer></script>', page.text)
        self.assertIn('id="open-settings"', page.text)
        self.assertIn('id="settings-dialog"', page.text)
        self.assertEqual(script.status_code, 200)
        self.assertIn("account-start-game", script.text)
        self.assertIn("addNovelDialogue", script.text)
        self.assertIn('settingsDialog.showModal()', script.text)
        self.assertIn('levelSelect.name = "english_level"', script.text)
        self.assertIn("payload.english_level", script.text)
        self.assertIn("dialogue-choices", script.text)
        self.assertIn("sceneChoices", script.text)

    def test_crime_vocabulary_is_protected_and_complete(self):
        self.assertEqual(self.client.get("/api/game/vocabulary").status_code, 401)
        self.register()

        response = self.client.get("/api/game/vocabulary")

        self.assertEqual(response.status_code, 200)
        exercises = response.json()["exercises"]
        games = response.json()["games"]
        self.assertEqual(len(exercises), 10)
        self.assertEqual(exercises[0]["id"], 1)
        self.assertIn("theft", exercises[0]["title"].casefold())
        self.assertEqual(exercises[-1]["id"], 10)
        self.assertEqual([game["id"] for game in games], ["crime-quiz", "word-detective", "mini-mystery"])
        self.assertTrue(all(len(game["questions"]) == 5 for game in games))

    def test_registration_level_and_admin_user_view(self):
        response = self.register("b2@example.com", english_level="B2")
        self.assertEqual(response.status_code, 200)

        with auth.connect() as connection:
            row = connection.execute(
                "SELECT created_at, last_active_at, english_level FROM users WHERE email = ?",
                ("b2@example.com",),
            ).fetchone()
        self.assertEqual(row["english_level"], "B2")
        self.assertEqual(row["last_active_at"], row["created_at"])

        users = admin_app.fetch_users(auth.DATABASE_PATH)
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0]["username"], "CaseSolver")
        self.assertEqual(users[0]["english_level"], "B2")
        self.assertNotIn("password_hash", users[0])
        self.assertNotIn("password_salt", users[0])

    def test_existing_user_database_is_migrated(self):
        legacy_path = Path(self.temp_dir.name) / "legacy.sqlite3"
        with sqlite3.connect(legacy_path) as connection:
            connection.execute(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    username TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password_salt TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                )
                """
            )
            connection.execute(
                """
                INSERT INTO users
                    (username, email, password_salt, password_hash, created_at)
                VALUES ('OldUser', 'old@example.com', 'salt', 'hash', 123)
                """
            )
        connection.close()

        with patch.object(auth, "DATABASE_PATH", legacy_path):
            auth.initialize_database()
            with auth.connect() as connection:
                row = connection.execute(
                    "SELECT english_level, last_active_at FROM users WHERE id = 1"
                ).fetchone()
        self.assertEqual(row["english_level"], "B2")
        self.assertEqual(row["last_active_at"], 123)

    def test_last_activity_timestamp_updates_on_authenticated_request(self):
        self.register()
        with auth.connect() as connection:
            connection.execute(
                "UPDATE users SET last_active_at = 1 WHERE email = ?",
                ("detective@example.com",),
            )

        self.assertTrue(self.client.get("/api/auth/me").json()["authenticated"])
        with auth.connect() as connection:
            updated_at = connection.execute(
                "SELECT last_active_at FROM users WHERE email = ?",
                ("detective@example.com",),
            ).fetchone()["last_active_at"]
        self.assertGreater(updated_at, 1)

    def test_login_updates_last_activity_timestamp(self):
        self.register()
        csrf = self.csrf_headers()
        self.client.post("/api/auth/logout", headers=csrf)
        with auth.connect() as connection:
            connection.execute(
                "UPDATE users SET last_active_at = 1 WHERE email = ?",
                ("detective@example.com",),
            )

        response = self.client.post(
            "/api/auth/login",
            json={
                "email": "detective@example.com",
                "password": "a-long-test-password",
            },
        )
        self.assertEqual(response.status_code, 200)
        with auth.connect() as connection:
            updated_at = connection.execute(
                "SELECT last_active_at FROM users WHERE email = ?",
                ("detective@example.com",),
            ).fetchone()["last_active_at"]
        self.assertGreater(updated_at, 1)

    def csrf_headers(self):
        return {"X-CSRF-Token": self.client.get("/api/auth/me").json()["csrf_token"]}

    def test_registration_validates_and_normalizes_unique_email(self):
        self.assertEqual(
            self.client.get("/api/auth/email-availability", params={"email": "bad"}).json(),
            {"valid": False, "available": False, "code": "invalid_email"},
        )
        self.assertTrue(
            self.client.get(
                "/api/auth/email-availability",
                params={"email": "New.Player@example.com"},
            ).json()["available"]
        )

        registered = self.register("New.Player@example.com")
        self.assertEqual(registered.status_code, 200)
        self.assertIn("httponly", registered.headers["set-cookie"].casefold())
        self.assertFalse(
            self.client.get(
                "/api/auth/email-availability",
                params={"email": "new.player@example.com"},
            ).json()["available"]
        )
        duplicate = self.register("NEW.PLAYER@example.com")
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(duplicate.json()["detail"]["code"], "email_taken")

        with auth.connect() as connection:
            saved = connection.execute(
                "SELECT password_hash, password_salt FROM users WHERE email = ?",
                ("new.player@example.com",),
            ).fetchone()
        self.assertNotEqual(saved["password_hash"], "a-long-test-password")
        self.assertNotEqual(saved["password_hash"], saved["password_salt"])

    def test_admin_delete_removes_account_data_and_frees_credentials(self):
        registered = self.register("delete-me@example.com")
        self.assertEqual(registered.status_code, 200)
        user_id = registered.json()["user"]["id"]

        admin_app.delete_user(user_id, auth.DATABASE_PATH)

        with auth.connect() as connection:
            self.assertIsNone(
                connection.execute(
                    "SELECT 1 FROM users WHERE id = ?", (user_id,)
                ).fetchone()
            )
            self.assertIsNone(
                connection.execute(
                    "SELECT 1 FROM sessions WHERE user_id = ?", (user_id,)
                ).fetchone()
            )
            self.assertIsNone(
                connection.execute(
                    "SELECT 1 FROM game_progress WHERE user_id = ?", (user_id,)
                ).fetchone()
            )

        recreated = self.register("delete-me@example.com")
        self.assertEqual(recreated.status_code, 200)

    def test_legacy_orphan_progress_does_not_block_new_registration(self):
        registered = self.register("legacy-delete@example.com")
        self.assertEqual(registered.status_code, 200)
        user_id = registered.json()["user"]["id"]

        # Reproduce the old admin deletion behavior: the user row was deleted
        # while foreign-key enforcement was disabled, leaving game_progress.
        with sqlite3.connect(auth.DATABASE_PATH) as connection:
            connection.execute("PRAGMA foreign_keys = OFF")
            connection.execute("DELETE FROM users WHERE id = ?", (user_id,))

        recreated = self.register("legacy-delete@example.com")
        self.assertEqual(recreated.status_code, 200)

    def test_login_and_protected_game_endpoints(self):
        self.assertEqual(self.client.get("/api/game").status_code, 401)
        self.register()
        csrf = self.csrf_headers()
        self.client.post("/api/auth/logout", headers=csrf)

        invalid_login = self.client.post(
            "/api/auth/login",
            json={"email": "detective@example.com", "password": "wrong-password"},
        )
        self.assertEqual(invalid_login.status_code, 401)

        valid_login = self.client.post(
            "/api/auth/login",
            json={"email": "DETECTIVE@example.com", "password": "a-long-test-password"},
        )
        self.assertEqual(valid_login.status_code, 200)
        self.assertTrue(self.client.get("/api/game").json()["suspects"])

        self.client.post("/api/auth/logout", headers=self.csrf_headers())
        username_login = self.client.post(
            "/api/auth/login",
            json={"email": "CaseSolver", "password": "a-long-test-password"},
        )
        self.assertEqual(username_login.status_code, 200)

    def test_puzzle_progress_is_validated_saved_and_resumable(self):
        self.assertEqual(self.client.get("/api/game/challenge").status_code, 401)
        self.register()
        csrf = self.csrf_headers()
        premature_accusation = self.client.post(
            "/api/accuse/may", headers=csrf
        )
        self.assertEqual(premature_accusation.status_code, 409)

        challenge_without_clues = self.client.get("/api/game/challenge")
        self.assertEqual(challenge_without_clues.status_code, 200)
        self.assertEqual(challenge_without_clues.json()["stage"], 0)

        self.assertEqual(
            self.client.post("/api/game/clues/0", headers=csrf).status_code, 200
        )
        self.assertEqual(
            self.client.post("/api/game/clues/99", headers=csrf).status_code, 404
        )
        self.assertEqual(
            self.client.post(
                "/api/game/clues/1", headers={"X-CSRF-Token": "wrong"}
            ).status_code,
            403,
        )
        for clue_id in (1, 2):
            self.client.post(f"/api/game/clues/{clue_id}", headers=csrf)
        challenge = self.client.get("/api/game/challenge")
        self.assertEqual(challenge.status_code, 200)
        self.assertEqual(challenge.json()["stage"], 0)

        wrong_answer = self.client.post(
            "/api/game/answer", json={"answer": "11"}, headers=csrf
        )
        self.assertFalse(wrong_answer.json()["correct"])
        self.assertEqual(wrong_answer.json()["progress"]["stage"], 0)

        first_pass = self.client.post(
            "/api/game/answer", json={"answer": "12"}, headers=csrf
        )
        self.assertTrue(first_pass.json()["correct"])
        self.assertEqual(first_pass.json()["progress"]["stage"], 1)
        second_pass = self.client.post(
            "/api/game/answer", json={"answer": "Lange"}, headers=csrf
        )
        self.assertTrue(second_pass.json()["correct"])
        self.assertEqual(second_pass.json()["progress"]["stage"], 2)

        correct_accusation = self.client.post(
                "/api/accuse/may", headers={"X-CSRF-Token": csrf["X-CSRF-Token"]}
        )
        self.assertTrue(correct_accusation.json()["correct"])

        persisted_progress = self.client.get("/api/game").json()["progress"]
        self.assertEqual(persisted_progress["stage"], 2)
        self.assertEqual(persisted_progress["clues"], [0, 1, 2])
        self.assertTrue(persisted_progress["completed"])

        restarted = self.client.post("/api/game/restart", headers=csrf)
        self.assertEqual(restarted.json(), {"stage": 0, "clues": [], "completed": False})

    def test_short_password_is_rejected(self):
        response = self.client.post(
            "/api/auth/register",
            json={
                "username": "CaseSolver",
                "email": "short@example.com",
                "password": "short",
            },
        )
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
