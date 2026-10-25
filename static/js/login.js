const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginMessage.textContent =
        "Вход пока не работает: серверная проверка пароля ещё не настроена.";
});
