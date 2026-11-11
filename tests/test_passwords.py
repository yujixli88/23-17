import unittest
from unittest.mock import patch

from pydantic import ValidationError

import database
from password_utils import hash_password, verify_password
from schemas import UserCreate

with patch.object(database.Base.metadata, "create_all"):
  import main


class PasswordValidationTests(unittest.TestCase):
  def test_accepts_password_meeting_all_requirements(self):
    user = UserCreate(email="player@example.com", password="ЧудесныйПароль42!")
    self.assertEqual(user.password, "ЧудесныйПароль42!")

  def test_accepts_password_longer_than_72_utf8_bytes(self):
    password = "ЧудесныйПароль42!" * 5

    self.assertGreater(len(password.encode("utf-8")), 72)
    self.assertEqual(
        UserCreate(email="player@example.com", password=password).password,
        password,
    )

  def test_rejects_password_missing_each_required_criterion(self):
    invalid_passwords = (
        "Ab1!short",
        "lowercase123!",
        "UPPERCASE123!",
        "NoDigitsHere!",
        "NoSpecialChar123",
        "Aa1!\ud800valid",
    )
    for password in invalid_passwords:
      with self.subTest(password=password):
        with self.assertRaises(ValidationError):
          UserCreate(email="player@example.com", password=password)

  def test_hash_is_salted_and_verifiable(self):
    password = "ЧудесныйПароль42!"
    first_hash = hash_password(password)
    second_hash = hash_password(password)

    self.assertNotEqual(first_hash, second_hash)
    self.assertTrue(verify_password(password, first_hash))
    self.assertFalse(verify_password("another-password", first_hash))
    self.assertFalse(verify_password(password, "invalid-hash"))

  def test_registration_stores_only_the_password_hash(self):
    class FakeQuery:
      def filter(self, _condition):
        return self

      def first(self):
        return None

    class FakeDatabase:
      added_user = None

      def query(self, _model):
        return FakeQuery()

      def add(self, user):
        self.added_user = user

      def commit(self):
        pass

      def refresh(self, user):
        user.id = 1

    db = FakeDatabase()
    password = "ЧудесныйПароль42!"
    main.register_user(
        UserCreate(email="player@example.com", password=password),
        db=db,
    )

    self.assertNotEqual(db.added_user.hashed_password, password)
    self.assertTrue(verify_password(password, db.added_user.hashed_password))


if __name__ == "__main__":
  unittest.main()
