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
