function openRegisterModal() {
    document.getElementById('regModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('regModal').style.display = 'none';
}

function registrationMessage(ru, en) {
    return localStorage.getItem('language') === 'en' ? en : ru;
}

async function submitRegistration(event) {
    event.preventDefault();
    if (!checkPassword()) {
        document.getElementById('register-message').textContent =
            registrationMessage(
                'Пароль не соответствует требованиям.',
                'Your password does not meet the requirements.'
            );
        return;
    }

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const message = document.getElementById('register-message');
    message.textContent = '';

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data));
            message.textContent = registrationMessage(
                'Регистрация успешна! Добро пожаловать.',
                'Registration successful! Welcome.'
            );
            startGame();
        } else {
            const data = await response.json();
            if (Array.isArray(data.detail)) {
                message.textContent = registrationMessage(
                    'Пароль не соответствует требованиям.',
                    'Your password does not meet the requirements.'
                );
            } else if (data.detail === 'Email already registered') {
                message.textContent = registrationMessage(
                    'Этот email уже зарегистрирован.',
                    'This email is already registered.'
                );
            } else {
                message.textContent = registrationMessage(
                    'Не удалось зарегистрироваться.',
                    'Registration failed.'
                );
            }
        }
    } catch (e) {
        console.error(e);
        message.textContent = registrationMessage(
            'Ошибка соединения с сервером.',
            'Could not connect to the server.'
        );
    }
}

function startGame() {
    // Переходим на страницу игры
    window.location.href = '/play';
}