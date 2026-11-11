import unicodedata

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


class UserResponse(BaseModel):
  id: int
  email: str
  glitters: int
  rank_level: str

  class Config:
    from_attributes = True