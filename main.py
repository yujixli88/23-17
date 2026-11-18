import base64
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import models
import schemas
from password_utils import hash_password, verify_password
from sqlalchemy.orm import Session

BASE_DIR = Path(__file__).resolve().parent

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
def read_menu(request: Request):
  """Главное меню (стартовая страница)"""
  return templates.TemplateResponse(request=request, name="menu.html")


@app.get("/play", response_class=HTMLResponse)
def read_game(request: Request):
  """Страница самой игры (сюжет)"""
  return templates.TemplateResponse(request=request, name="game.html")


@app.get("/login", response_class=HTMLResponse)
def read_login(request: Request):
  """Страница входа"""
  return templates.TemplateResponse(request=request, name="login.html")


@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
  db_user = (
      db.query(models.User)
      .filter(models.User.email == user.email)
      .first()
  )
  if db_user:
    raise HTTPException(
        status_code=400, detail="Email already registered"
    )

  new_user = models.User(
      email=user.email,
      hashed_password=hash_password(user.password),
      glitters=0,
      rank_level="Базовый уровень",
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user


@app.post("/api/login", response_model=schemas.UserResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
  db_user = (
      db.query(models.User)
      .filter(models.User.email == user.email)
      .first()
  )
  if db_user is None or not verify_password(
      user.password, db_user.hashed_password
  ):
    raise HTTPException(
        status_code=401, detail="Invalid email or password"
    )

  return db_user


@app.put("/api/profile", response_model=schemas.UserResponse)
def update_profile(
    profile: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
):
  db_user = (
      db.query(models.User)
      .filter(models.User.email == profile.email)
      .first()
  )
  if db_user is None or not verify_password(
      profile.password, db_user.hashed_password
  ):
    raise HTTPException(status_code=401, detail="Invalid email or password")

  db_profile = db_user.profile
  if db_profile is None:
    db_profile = models.UserProfile(user_id=db_user.id)
    db_user.profile = db_profile
    db.add(db_profile)

  db_profile.display_name = profile.display_name
  db_profile.date_of_birth = profile.date_of_birth
  db_profile.phone = profile.phone
  if profile.remove_avatar:
    db_profile.avatar_data = None
    db_profile.avatar_mime_type = None
  elif profile.avatar_data is not None:
    image = base64.b64decode(profile.avatar_data, validate=True)
    if image.startswith(b"\x89PNG\r\n\x1a\n"):
      db_profile.avatar_mime_type = "image/png"
    elif image.startswith(b"\xff\xd8\xff"):
      db_profile.avatar_mime_type = "image/jpeg"
    else:
      db_profile.avatar_mime_type = "image/webp"
    db_profile.avatar_data = profile.avatar_data

  db.commit()
  db.refresh(db_user)
  return db_user