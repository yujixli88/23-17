from database import Base
from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship


class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  hashed_password = Column(String)
  glitters = Column(Integer, default=0)
  rank_level = Column(String, default="Базовый уровень")
  profile = relationship(
      "UserProfile",
      back_populates="user",
      uselist=False,
      cascade="all, delete-orphan",
  )


class UserProfile(Base):
  __tablename__ = "user_profiles"

  user_id = Column(
      Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
  )
  display_name = Column(String(32), nullable=False)
  date_of_birth = Column(Date, nullable=True)
  phone = Column(String(32), nullable=True)
  avatar_data = Column(Text, nullable=True)
  avatar_mime_type = Column(String(16), nullable=True)
  user = relationship("User", back_populates="profile")