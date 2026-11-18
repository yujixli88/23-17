(() => {
    const profileModal = document.getElementById("profile-modal");
    let pendingSignupCredentials = null;

    function profileMessage(ru, en) {
        return document.documentElement.lang === "en" ? en : ru;
    }

    function currentUser() {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    }

    function setAvatarPreview(form, avatarData, mimeType) {
        const image = form.querySelector(".avatar-preview-image");
        const placeholder = form.querySelector(".avatar-preview-placeholder");
        if (avatarData && mimeType) {
            image.src = `data:${mimeType};base64,${avatarData}`;
            image.hidden = false;
            placeholder.hidden = true;
        } else {
            image.removeAttribute("src");
            image.hidden = true;
            placeholder.hidden = false;
        }
    }

    function fillProfileForm(form, profile) {
        form.elements.display_name.value = profile?.display_name || "";
        form.elements.date_of_birth.value = profile?.date_of_birth || "";
        form.elements.phone.value = profile?.phone || "";
        form.elements.avatar.value = "";
        form.elements.remove_avatar.checked = false;
        form.elements.password.value = "";
        form.querySelector(".profile-message").textContent = "";
        setAvatarPreview(form, profile?.avatar_data, profile?.avatar_mime_type);
    }

    function readImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                if (typeof reader.result !== "string") {
                    reject(new Error("Could not read the selected avatar."));
                    return;
                }
                resolve(reader.result.split(",")[1]);
            });
            reader.addEventListener("error", () => {
                reject(new Error("Could not read the selected avatar."));
            });
            reader.readAsDataURL(file);
        });
    }

    function showProfileModal(form, profile) {
        fillProfileForm(form, profile);
        const isSignupSetup = pendingSignupCredentials !== null;
        form.querySelector(".profile-password-field").hidden = isSignupSetup;
        form.querySelector(".profile-cancel").hidden = isSignupSetup;
        profileModal.style.display = "flex";
        form.elements.display_name.focus();
    }

    function renderUserProfile(user) {
        const status = document.getElementById("profile-status");
        if (!status) {
            return;
        }

        const profile = user?.profile;
        const language = document.documentElement.lang;
        status.textContent = profile?.display_name
            || (user
                ? (language === "en" ? "Name not set" : "Имя не задано")
                : (language === "en" ? "Guest" : "Гость"));

        const rank = document.getElementById("rank-display");
        if (rank && user?.rank_level) {
            rank.textContent = language === "en"
                && user.rank_level === "Базовый уровень"
                ? "Basic level"
                : user.rank_level;
        }

        const avatar = document.getElementById("profile-avatar-image");
        const placeholder = document.getElementById("profile-avatar-placeholder");
        if (avatar && placeholder) {
            if (profile?.avatar_data && profile.avatar_mime_type) {
                avatar.src = `data:${profile.avatar_mime_type};base64,${profile.avatar_data}`;
                avatar.hidden = false;
                placeholder.hidden = true;
            } else {
                avatar.removeAttribute("src");
                avatar.hidden = true;
                placeholder.hidden = false;
            }
        }

        const editButton = document.querySelector(".profile-edit-button");
        if (editButton) {
            editButton.hidden = !user;
        }
    }

    window.renderUserProfile = renderUserProfile;

    window.openProfileSetup = (credentials) => {
        pendingSignupCredentials = credentials;
        const form = profileModal.querySelector(".profile-form");
        showProfileModal(form, null);
    };

    window.openProfileEditor = () => {
        pendingSignupCredentials = null;
        const form = profileModal.querySelector(".profile-form");
        showProfileModal(form, currentUser()?.profile);
    };

    window.closeProfileModal = () => {
        if (!pendingSignupCredentials) {
            profileModal.style.display = "none";
        }
    };

    if (profileModal) {
        const form = profileModal.querySelector(".profile-form");
        const avatarInput = form.elements.avatar;
        const avatarMessage = form.querySelector(".profile-message");
        avatarInput.addEventListener("change", () => {
            const file = avatarInput.files[0];
            if (file) {
                if (
                    file.size > 1024 * 1024
                    || !["image/png", "image/jpeg", "image/webp"].includes(file.type)
                ) {
                    avatarMessage.textContent = profileMessage(
                        "Выберите PNG, JPEG или WebP размером не более 1 МБ.",
                        "Choose a PNG, JPEG, or WebP image no larger than 1 MB."
                    );
                    avatarInput.value = "";
                    return;
                }
                avatarMessage.textContent = "";
                form.elements.remove_avatar.checked = false;
                setAvatarPreview(form, null, null);
                readImage(file).then((avatarData) => {
                    setAvatarPreview(form, avatarData, file.type);
                }).catch((error) => {
                    console.error(error);
                    avatarMessage.textContent = profileMessage(
                        "Не удалось прочитать изображение.",
                        "Could not read the image."
                    );
                });
            } else {
                const profile = currentUser()?.profile;
                setAvatarPreview(form, profile?.avatar_data, profile?.avatar_mime_type);
            }
        });
        form.elements.remove_avatar.addEventListener("change", () => {
            if (form.elements.remove_avatar.checked) {
                avatarInput.value = "";
                setAvatarPreview(form, null, null);
            } else {
                const profile = currentUser()?.profile;
                setAvatarPreview(form, profile?.avatar_data, profile?.avatar_mime_type);
            }
        });
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const message = form.querySelector(".profile-message");
            const user = currentUser();
            const credentials = pendingSignupCredentials || {
                email: user?.email,
                password: form.elements.password.value,
            };
            const file = avatarInput.files[0];

            if (!credentials.email || !credentials.password) {
                message.textContent = profileMessage(
                    "Введите пароль, чтобы сохранить профиль.",
                    "Enter your password to save your profile."
                );
                return;
            }
            if (file && (
                file.size > 1024 * 1024
                || !["image/png", "image/jpeg", "image/webp"].includes(file.type)
            )) {
                message.textContent = profileMessage(
                    "Выберите PNG, JPEG или WebP размером не более 1 МБ.",
                    "Choose a PNG, JPEG, or WebP image no larger than 1 MB."
                );
                return;
            }

            message.textContent = "";
            let avatarData = null;
            if (file) {
                try {
                    avatarData = await readImage(file);
                } catch (error) {
                    console.error(error);
                    message.textContent = profileMessage(
                        "Не удалось прочитать изображение.",
                        "Could not read the image."
                    );
                    return;
                }
            }

            try {
                const profile = {
                    email: credentials.email,
                    password: credentials.password,
                    display_name: form.elements.display_name.value,
                    date_of_birth: form.elements.date_of_birth.value || null,
                    phone: form.elements.phone.value,
                    remove_avatar: form.elements.remove_avatar.checked,
                };
                if (avatarData) {
                    profile.avatar_data = avatarData;
                    profile.remove_avatar = false;
                }

                const response = await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profile),
                });

                if (!response.ok) {
                    message.textContent = response.status === 401
                        ? profileMessage(
                            "Неверный пароль.",
                            "Incorrect password."
                        )
                        : profileMessage(
                            "Не удалось сохранить профиль. Проверьте введённые данные.",
                            "Could not save the profile. Check the information and try again."
                        );
                    return;
                }

                const updatedUser = await response.json();
                localStorage.setItem("user", JSON.stringify(updatedUser));
                renderUserProfile(updatedUser);
                if (pendingSignupCredentials) {
                    pendingSignupCredentials = null;
                    window.location.href = "/play";
                    return;
                }
                profileModal.style.display = "none";
            } catch (error) {
                console.error(error);
                message.textContent = profileMessage(
                    "Не удалось сохранить профиль. Проверьте соединение и повторите.",
                    "Could not save the profile. Check your connection and try again."
                );
            }
        });
    }

    renderUserProfile(currentUser());
})();
