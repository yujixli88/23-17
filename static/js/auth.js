function openRegisterModal() {
    document.getElementById('regModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('regModal').style.display = 'none';
}

async function submitRegistration(event) {
    event.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Сохраняем данные пользователя в localStorage браузера
            localStorage.setItem('user', JSON.stringify(data));
            alert('Регистрация успешна! Добро пожаловать.');
            startGame();
        } else {
            alert('Ошибка регистрации (возможно, email уже занят).');
        }
    } catch (e) {
        console.error(e);
        alert('Ошибка соединения с сервером.');
    }
}

function startGame() {
    // Переходим на страницу игры
    window.location.href = '/play';
}