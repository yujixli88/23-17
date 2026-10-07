from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import models
import schemas
from sqlalchemy.orm import Session

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
def read_menu(request: Request):
  """Главное меню (стартовая страница)"""
  return templates.TemplateResponse("menu.html", {"request": request})


@app.get("/play", response_class=HTMLResponse)
def read_game(request: Request):
  """Страница самой игры (сюжет)"""
  return templates.TemplateResponse("game.html", {"request": request})


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
      hashed_password=user.password,
      glitters=0,
      rank_level="Базовый уровень",
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user