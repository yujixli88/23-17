(() => {
    const criterionIds = {
        length: "length",
        lowercase: "lowercase",
        uppercase: "uppercase",
        number: "number",
        symbol: "symbol",
    };

    function normalize(value) {
        return value
            .normalize("NFKD")
            .replace(/\p{M}/gu, "")
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]/gu, "");
    }

    function evaluate(password, email = "") {
        const value = typeof password === "string" ? password : "";
        const criteria = {
            length: [...value].length >= 10 && [...value].length <= 128,
            lowercase: /\p{Ll}/u.test(value),
            uppercase: /\p{Lu}/u.test(value),
            number: /\p{Nd}/u.test(value),
            symbol: /[\p{P}\p{S}]/u.test(value),
        };
        const personalTerm = normalize(String(email).split("@", 1)[0]);

        return {
            criteria,
            valid: Object.values(criteria).every(Boolean),
            containsEmailLocalPart: personalTerm.length > 2
                && normalize(value).includes(personalTerm),
        };
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
        return characters.join("");
    }

    window.PasswordValidation = Object.freeze({ evaluate, generatePassword });

    const passwordInput = document.getElementById("regPassword");
    const emailInput = document.getElementById("regEmail");
    const form = document.getElementById("register-form");
    if (!passwordInput || !emailInput || !form) return;

    function checkPassword() {
        const result = evaluate(passwordInput.value, emailInput.value);
        for (const [key, id] of Object.entries(criterionIds)) {
            const element = document.getElementById(id);
            if (!element) continue;
            element.classList.toggle("valid", result.criteria[key]);
            const status = element.querySelector(".criterion-status");
            if (status) status.textContent = result.criteria[key] ? "✓" : "✗";
        }
        const personalTip = document.getElementById("personal");
        if (personalTip) personalTip.hidden = !result.containsEmailLocalPart;
        return result.valid;
    }

    function fillGeneratedPassword() {
        passwordInput.value = generatePassword();
        passwordInput.type = "text";
        checkPassword();
        passwordInput.focus();
    }

    passwordInput.addEventListener("input", checkPassword);
    emailInput.addEventListener("input", checkPassword);
    form.addEventListener("submit", (event) => {
        if (checkPassword()) return;
        event.preventDefault();
        const message = document.getElementById("register-message");
        if (message) {
            message.textContent = localStorage.getItem("language") === "en"
                ? "Your password does not meet the requirements."
                : "Пароль не соответствует требованиям.";
        }
    });

    window.checkPassword = checkPassword;
    window.generatePassword = fillGeneratedPassword;
    checkPassword();
})();
