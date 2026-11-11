const passwordInput = document.getElementById("regPassword");
const emailInput = document.getElementById("regEmail");

const requiredCriteria = {
    length: document.getElementById("length"),
    lowercase: document.getElementById("lowercase"),
    uppercase: document.getElementById("uppercase"),
    number: document.getElementById("number"),
    symbol: document.getElementById("symbol"),
};

function normalize(value) {
    return value
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
}

function setCriterion(element, passed) {
    element.classList.toggle("valid", passed);
    element.querySelector(".criterion-status").textContent = passed ? "✓" : "✗";
}

function checkPassword() {
    const password = passwordInput.value;
    const valid = {
        length: [...password].length >= 10,
        lowercase: /\p{Ll}/u.test(password),
        uppercase: /\p{Lu}/u.test(password),
        number: /\p{Nd}/u.test(password),
        symbol: /[\p{P}\p{S}]/u.test(password),
    };

    for (const [key, element] of Object.entries(requiredCriteria)) {
        setCriterion(element, valid[key]);
    }

    const emailLocalPart = emailInput.value.split("@", 1)[0];
    const personalTerm = normalize(emailLocalPart);
    const passwordContainsEmail = personalTerm.length > 2
        && normalize(password).includes(personalTerm);
    document.getElementById("personal").hidden = !passwordContainsEmail;

    return Object.values(valid).every(Boolean);
}

function generatePassword() {
    const characterSets = [
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789",
        "!@#$%^&*()-_=+[]{}?",
    ];
    const allCharacters = characterSets.join("");

    function randomIndex(limit) {
        const range = 0x100000000;
        const max = Math.floor(range / limit) * limit;
        const value = new Uint32Array(1);
        do {
            window.crypto.getRandomValues(value);
        } while (value[0] >= max);
        return value[0] % limit;
    }

    const characters = characterSets.map((set) => set[randomIndex(set.length)]);
    for (let index = 0; index < 12; index += 1) {
        characters.push(allCharacters[randomIndex(allCharacters.length)]);
    }
    for (let index = characters.length - 1; index > 0; index -= 1) {
        const otherIndex = randomIndex(index + 1);
        [characters[index], characters[otherIndex]] =
            [characters[otherIndex], characters[index]];
    }

    passwordInput.value = characters.join("");
    passwordInput.type = "text";
    checkPassword();
    passwordInput.focus();
}

passwordInput.addEventListener("input", checkPassword);
emailInput.addEventListener("input", checkPassword);
document.getElementById("register-form").addEventListener("submit", (event) => {
    if (!checkPassword()) {
        event.preventDefault();
        document.getElementById("register-message").textContent =
            localStorage.getItem("language") === "en"
                ? "Your password does not meet the requirements."
                : "Пароль не соответствует требованиям.";
    }
});

checkPassword();
