import base64
import binascii
import unicodedata
from datetime import date

from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
  email: str
  password: str

  @field_validator("password")
  @classmethod
  def validate_password(cls, password: str) -> str:
    errors = []
    if len(password) < 10:
      errors.append("at least 10 characters")
    try:
      password.encode("utf-8")
    except UnicodeEncodeError:
      errors.append("valid UTF-8 characters")
    if not any(unicodedata.category(char) == "Ll" for char in password):
      errors.append("a lowercase letter")
    if not any(unicodedata.category(char) == "Lu" for char in password):
      errors.append("an uppercase letter")
    if not any(char.isdecimal() for char in password):
      errors.append("a digit")
    if not any(unicodedata.category(char)[0] in "PS" for char in password):
      errors.append("a special character")

    if errors:
      raise ValueError("Password requirements not met: " + ", ".join(errors))
    return password


class UserLogin(BaseModel):
  email: str
  password: str


class UserProfileResponse(BaseModel):
  display_name: str
  date_of_birth: date | None
  phone: str | None
  avatar_data: str | None
  avatar_mime_type: str | None

  class Config:
    from_attributes = True


class UserResponse(BaseModel):
  id: int
  email: str
  glitters: int
  rank_level: str
  profile: UserProfileResponse | None = None

  class Config:
    from_attributes = True


class ProfileUpdate(BaseModel):
  email: str
  password: str
  display_name: str
  date_of_birth: date | None = None
  phone: str | None = None
  avatar_data: str | None = None
  remove_avatar: bool = False

  @field_validator("display_name")
  @classmethod
  def validate_display_name(cls, display_name: str) -> str:
    display_name = display_name.strip()
    if not display_name:
      raise ValueError("Display name is required")
    if len(display_name) > 32:
      raise ValueError("Display name must be 32 characters or fewer")
    return display_name

  @field_validator("date_of_birth")
  @classmethod
  def validate_date_of_birth(cls, value: date | None) -> date | None:
    if value is not None and value > date.today():
      raise ValueError("Date of birth cannot be in the future")
    return value

  @field_validator("phone", mode="before")
  @classmethod
  def validate_phone(cls, value: str | None) -> str | None:
    if value is None:
      return None
    if not isinstance(value, str):
      raise ValueError("Enter a valid phone number")
    phone = value.strip()
    if not phone:
      return None
    if (
        len(phone) > 32
        or not all(char.isdecimal() or char in "+()- " for char in phone)
        or not 7 <= sum(char.isdecimal() for char in phone) <= 15
    ):
      raise ValueError("Enter a valid phone number")
    return phone

  @field_validator("avatar_data")
  @classmethod
  def validate_avatar_data(cls, value: str | None) -> str | None:
    if value is None:
      return None
    if len(value) > 1_398_104:
      raise ValueError("Avatar must be no larger than 1 MB")
    try:
      image = base64.b64decode(value, validate=True)
    except (binascii.Error, ValueError):
      raise ValueError("Avatar must be a valid base64-encoded image") from None

    if len(image) > 1024 * 1024:
      raise ValueError("Avatar must be no larger than 1 MB")
    if not (
        image.startswith(b"\x89PNG\r\n\x1a\n")
        or image.startswith(b"\xff\xd8\xff")
        or (
            len(image) >= 12
            and image.startswith(b"RIFF")
            and image[8:12] == b"WEBP"
        )
    ):
      raise ValueError("Avatar must be a PNG, JPEG, or WebP image")
    return value