import base64
import os
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException
from starlette.requests import Request

_bootstrap = tempfile.TemporaryDirectory()
_previous_database_path = os.environ.get("GAME_DATABASE_PATH")
os.environ["GAME_DATABASE_PATH"] = str(Path(_bootstrap.name) / "bootstrap.sqlite3")

import auth
import main

if _previous_database_path is None:
    os.environ.pop("GAME_DATABASE_PATH", None)
else:
    os.environ["GAME_DATABASE_PATH"] = _previous_database_path


def make_request(csrf_token="test-csrf-token"):
    return Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "POST",
            "scheme": "http",
            "path": "/api/auth/profile",
            "raw_path": b"/api/auth/profile",
            "query_string": b"",
            "headers": [(b"x-csrf-token", csrf_token.encode("ascii"))],
            "client": ("127.0.0.1", 1234),
            "server": ("testserver", 80),
        }
    )


class ProfileApiTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temporary_directory.name) / "game.sqlite3"
        self.database_patch = patch.object(auth, "DATABASE_PATH", self.database_path)
        self.database_patch.start()
        auth.initialize_database()
        self.user = auth.create_user(
            "profile_player", "profile@example.com", "ProfilePassword42!"
        )
        _cookie, self.csrf_token = auth.create_session(self.user["id"])
        self.session = {
            "user": self.user,
            "csrf_token": self.csrf_token,
        }

    def tearDown(self):
        self.database_patch.stop()
        self.temporary_directory.cleanup()

    def test_profile_update_requires_csrf_and_persists_private_fields_and_avatar(self):
        avatar = base64.b64encode(b"\x89PNG\r\n\x1a\n").decode("ascii")
        payload = main.ProfilePayload(
            display_name="  Detective  ",
            date_of_birth="2000-01-02",
            phone="+1 555 123 4567",
            avatar_data=f"data:image/png;base64,{avatar}",
        )

        with self.assertRaises(HTTPException) as csrf_error:
            main.save_profile(
                payload, make_request("wrong-token"), self.session
            )
        self.assertEqual(csrf_error.exception.status_code, 403)

        result = main.save_profile(
            payload, make_request(self.csrf_token), self.session
        )
        self.assertEqual(result["display_name"], "Detective")
        self.assertEqual(result["date_of_birth"], "2000-01-02")
        self.assertEqual(result["phone"], "+1 555 123 4567")
        self.assertEqual(result["avatar_data"], avatar)
        self.assertEqual(result["avatar_mime_type"], "image/png")

    def test_profile_update_rejects_future_birth_date_and_invalid_avatar(self):
        future_date = (date.today() + timedelta(days=1)).isoformat()
        with self.assertRaises(HTTPException) as date_error:
            main.save_profile(
                main.ProfilePayload(
                    display_name="Detective",
                    date_of_birth=future_date,
                ),
                make_request(self.csrf_token),
                self.session,
            )
        self.assertEqual(date_error.exception.status_code, 422)

        with self.assertRaises(HTTPException) as avatar_error:
            main.save_profile(
                main.ProfilePayload(
                    display_name="Detective",
                    avatar_data="data:image/png;base64,bm90IGFuIGltYWdl",
                ),
                make_request(self.csrf_token),
                self.session,
            )
        self.assertEqual(avatar_error.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
