from database import Base
from sqlalchemy import Column, Integer, String


class User(Base):
  tablename = "users"

  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  hashed_password = Column(String)
  glitters = Column(Integer, default=0)
  rank_level = Column(String, default="Базовый уровень")