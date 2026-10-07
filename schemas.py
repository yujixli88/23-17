from pydantic import BaseModel


class UserCreate(BaseModel):
  email: str
  password: str


class UserResponse(BaseModel):
  id: int
  email: str
  glitters: int
  rank_level: str

  class Config:
    from_attributes = True