const gameScript = document.createElement("script");
gameScript.src = localStorage.getItem("language") === "en"
    ? "/static/js/game-en.js"
    : "/static/js/game.js";
document.body.append(gameScript);
