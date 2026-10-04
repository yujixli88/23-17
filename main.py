from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

from game_logic import start_game

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


@app.get("/game")
def game():
    return start_game()