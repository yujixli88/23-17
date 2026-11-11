const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function loginMessageText(ru, en) {
    return localStorage.getItem("language") === "en" ? en : ru;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("login-email").value,
                password: document.getElementById("login-password").value,
            }),
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "/play";
            return;
        }

        loginMessage.textContent = response.status === 401
            ? loginMessageText(
                "Неверная почта или пароль.",
                "Incorrect email or password."
            )
            : loginMessageText(
                "Не удалось выполнить вход.",
                "Could not log in."
            );
    } catch (error) {
        console.error(error);
        loginMessage.textContent = loginMessageText(
            "Ошибка соединения с сервером.",
            "Could not connect to the server."
        );
    }
});
