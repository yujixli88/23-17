import base64
import unittest
from datetime import date
from unittest.mock import patch

from pydantic import ValidationError

import database
from password_utils import hash_password
from schemas import ProfileUpdate

with patch.object(database.Base.metadata, "create_all"):
  import main


class ProfileValidationTests(unittest.TestCase):
  def test_normalizes_display_name_and_empty_phone(self):
    profile = ProfileUpdate(
        email="player@example.com",
        password="password",
        display_name="  Detective  ",
        phone=" ",
    )

    self.assertEqual(profile.display_name, "Detective")
    self.assertIsNone(profile.phone)

  def test_rejects_future_birth_date_and_invalid_phone(self):
    invalid_profiles = (
        {"date_of_birth": date(2100, 1, 1)},
        {"phone": "not-a-phone"},
    )
    for fields in invalid_profiles:
      with self.subTest(fields=fields):
        with self.assertRaises(ValidationError):
          ProfileUpdate(
              email="player@example.com",
              password="password",
              display_name="Detective",
              **fields,
          )

  def test_accepts_png_avatar_and_rejects_non_image_data(self):
    png_header = b"\x89PNG\r\n\x1a\n"
    valid_avatar = base64.b64encode(png_header).decode("ascii")
    profile = ProfileUpdate(
        email="player@example.com",
        password="password",
        display_name="Detective",
        avatar_data=valid_avatar,
    )
    self.assertEqual(profile.avatar_data, valid_avatar)

    with self.assertRaises(ValidationError):
      ProfileUpdate(
          email="player@example.com",
          password="password",
          display_name="Detective",
          avatar_data=base64.b64encode(b"not an image").decode("ascii"),
      )

  def test_rejects_oversized_avatar_before_decoding(self):
    with self.assertRaises(ValidationError):
      ProfileUpdate(
          email="player@example.com",
          password="password",
          display_name="Detective",
          avatar_data="A" * 1_398_105,
      )


class ProfileUpdateTests(unittest.TestCase):
  def test_profile_update_requires_valid_password_and_saves_private_fields(self):
    password = "Password123!"
    user = main.models.User(
        id=1,
        email="player@example.com",
        hashed_password=hash_password(password),
        glitters=0,
        rank_level="Базовый уровень",
    )

    class FakeQuery:
      def filter(self, _condition):
        return self

      def first(self):
        return user

    class FakeDatabase:
      added_profile = None

      def query(self, _model):
        return FakeQuery()

      def add(self, profile):
        self.added_profile = profile

      def commit(self):
        pass

      def refresh(self, _instance):
        pass

    db = FakeDatabase()
    request = ProfileUpdate(
        email="player@example.com",
        password=password,
        display_name="Detective",
        date_of_birth=date(2000, 1, 1),
        phone="+1 555 123 4567",
    )
    result = main.update_profile(request, db=db)

    self.assertIs(result, user)
    self.assertEqual(user.profile.display_name, "Detective")
    self.assertEqual(user.profile.date_of_birth, date(2000, 1, 1))
    self.assertEqual(user.profile.phone, "+1 555 123 4567")
    self.assertIs(db.added_profile, user.profile)
    response = main.schemas.UserResponse.model_validate(user)
    self.assertEqual(response.profile.display_name, "Detective")

    request.password = "WrongPassword!"
    with self.assertRaises(main.HTTPException) as error:
      main.update_profile(request, db=db)
    self.assertEqual(error.exception.status_code, 401)


if __name__ == "__main__":
  unittest.main()
