from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

from game_logic import accuse, start_game

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(BASE_DIR / "game.html")


@app.get("/game.css", include_in_schema=False)
def game_styles():
    return FileResponse(BASE_DIR / "game.css", media_type="text/css")


@app.get("/game.js", include_in_schema=False)
def game_script():
    return FileResponse(BASE_DIR / "game.js", media_type="text/javascript")


@app.get("/api/game")
def get_game():
    return start_game()

@app.get("/api/accuse/{suspect_id}")
def accuse_player(suspect_id: str):
    return accuse(suspect_id)

@app.get("/api/login")
def login_user(username: str, password: str):
    # Короче здесь логин и пароль
    if username == "admin" and password == "password":
        return {"success": True, "message": "Вы успешно вошли в систему!"}
    else:
        return {"success": False, "message": "Неверный логин или пароль. Попробуйте снова."}

