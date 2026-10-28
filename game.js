(() => {
        const screen = document.getElementById("game-screen");
        const status = document.getElementById("game-status");
        const languageSelect = document.getElementById("language-select");
        const settingsDialog = document.getElementById("settings-dialog");
        const openSettings = document.getElementById("open-settings");
        const closeSettings = document.getElementById("close-settings");
        const gameWindow = document.getElementById("game-window");
        const accountGuests = document.getElementById("account-guests");
        const accountNotebookButton = document.getElementById("account-notebook-button");
        const accountStartGame = document.getElementById("account-start-game");
        const accountLogout = document.getElementById("account-logout");
        const accountClues = document.getElementById("account-clues");
        const restoreGame = document.getElementById("restore-game");
        const state = {
          game: null,
          started: false,
          clues: new Set(),
          view: "scene",
          stage: 0,
          csrfToken: "",
          user: null,
          authMode: "login",
          language: localStorage.getItem("game-language") === "en" ? "en" : "ru",
        };

        const copy = {
          ru: {
            title: "Последний звонок в 23:17",
            windowLabel: "Игровое окно детективного квеста",
            window: "Детективное агентство · новое дело",
            settings: "Настройки",
            settingsDescription: "Параметры игры",
            closeSettings: "Закрыть",
            profile: "Профиль пользователя",
            language: "Язык",
            logo: "🕰 Последний звонок",
            account: "Аккаунт",
            accountName: "Детектив",
            accountRole: "Игрок",
            guestsButton: "Гости отеля",
            playButton: "Играть",
            detective: "Детектив",
            dialogueLabel: "Реплика персонажа",
            placeholderDialogue: "1",
            blackScene: "Сцена игры",
            notebook: "Блокнот улик",
            notebookButton: "Блокнот улик",
            emptyClues: "Начните расследование, чтобы собирать улики.",
            signIn: "Войти",
            signUp: "Создать аккаунт",
            authIntro: "Войдите или создайте аккаунт. Прогресс расследования будет сохранён.",
            username: "Имя пользователя",
            email: "Электронная почта",
            englishLevel: "Уровень английского",
            password: "Пароль (не менее 12 символов)",
            loginButton: "Войти",
            registerButton: "Зарегистрироваться",
            switchRegister: "Нет аккаунта? Зарегистрируйтесь",
            switchLogin: "Уже есть аккаунт? Войдите",
            emailChecking: "Проверяем адрес…",
            emailInvalid: "Введите корректный адрес электронной почты.",
            emailTaken: "Этот адрес уже зарегистрирован.",
            emailAvailable: "Этот адрес свободен ✓",
            signOut: "Выйти",
            authFailed: "Не удалось выполнить запрос. Проверьте данные и повторите попытку.",
            weakPassword: "Пароль должен содержать от 12 до 128 символов.",
            usernameTaken: "Это имя пользователя уже занято.",
            authenticated: "Выполнен вход",
            continueGame: "Продолжить расследование",
            findThreeClues: "Найдите не менее трёх улик, чтобы открыть головоломки.",
            solveChallenge: "Решить головоломку",
            challengeTitle: "Испытание детектива",
            answerPlaceholder: "Ваш ответ",
            checkAnswer: "Проверить ответ",
            retryLater: "Попробовать позже",
            challengePassed: "Верно! Вы открыли следующую часть расследования.",
            challengeFailed: "Пока неверно. Прогресс сохранён — можно вернуться к испытанию позже.",
            nextChallenge: "Продолжить",
            finalChallenge: "Головоломки решены. Теперь можно обвинить подозреваемого.",
            gameCompleted: "Расследование завершено. Ваш прогресс сохранён.",
            noGame: "Войдите, чтобы начать игру.",
            csrfError: "Сессия устарела. Войдите снова.",
            challengePrompts: [
              "Часы пробили одиннадцать раз, а затем добавили один удар вручную. Сколько ударов услышали гости всего?",
              "На старой фотографии указано настоящее имя Элизы. Какая у неё настоящая фамилия?",
            ],
            challengeQuestion: "Вопрос",
            resumeChallenge: "Возобновить испытание",
            logoutError: "Не удалось завершить сеанс. Попробуйте ещё раз.",
            restore: "Развернуть игру",
            minimize: "Свернуть игру",
            noCase: "Дело не начато",
            progress: (found, total) => `23:17 · Найдено улик: ${found}/${total}`,
            caseNumber: "Дело № 2317",
            introTitle: "Последний звонок в 23:17",
            intro: "Снежная буря заперла вас в старом загородном отеле. Хозяин найден мёртвым в кабинете, а часы пробили время, которого не должно было быть.",
            storm: "СНЕЖНАЯ БУРЯ · 23:17",
            startHint: "Начните расследование. Осматривайте кабинет, собирайте улики и поговорите с гостями.",
            start: "Начать расследование",
            room: "Кабинет Виктора Ардена",
            inspectRoom: "Кабинет Виктора Ардена",
            inspectHint: "Выберите предметы, которые хотите изучить. Каждая находка попадёт в блокнот.",
            lockedRoom: "ЗАПЕРТЫЙ КАБИНЕТ · СНЕГ ЗА ОКНОМ",
            talkGuests: "Поговорить с гостями",
            guests: "Гости отеля",
            chooseGuest: "Кого расспросить?",
            guestHint: "Пятеро гостей остались в отеле. Выберите человека, чтобы узнать его версию событий.",
            talk: "Поговорить",
            journal: "Блокнот детектива",
            collectedClues: "Собранные улики",
            journalHint: "Записи, которые вы сделали во время осмотра.",
            emptyJournal: "Пока здесь пусто. Вернитесь в кабинет и осмотрите предметы.",
            accuseReady: "Перейти к обвинению",
            inspectLabel: "Осмотр кабинета",
            continue: "Продолжить осмотр",
            interview: "Разговор с подозреваемым",
            motive: "Мотив",
            accusePerson: "Обвинить этого человека",
            backToGuests: "Вернуться к гостям",
            notEnoughTitle: "Выводы делать рано",
            notEnoughText: "Осмотрите ещё хотя бы три предмета в кабинете, прежде чем обвинять кого-либо.",
            backToScene: "Вернуться к осмотру",
            checking: "Проверяем вашу версию…",
            revealed: "Дело раскрыто",
            wrongTitle: "Неверный вывод",
            wrongMessage: "Это решение слишком поспешно. В деле важно не только то, кто знал о преступлении, но и кто знал об истинной личности Элизы и тайне Ардена.",
            wrongSummary: "Правда скрыта в семейной подделке и в том, как Виктор Арден контролировал воспоминания о своём прошлом.",
            rightTitle: "Правильный вывод",
            rightMessage: "София Ланге — настоящая убийца. Она знала правду о похищенной дочери и использовала ложный удар часов, чтобы замести следы и подменить время смерти.",
            rightSummary: "Арден не был убит в 23:17. Он умер гораздо раньше, и именно София знала это, потому что она была связана с самой тайной, которую хранит отель.",
            restart: "Начать заново",
            continueInvestigation: "Продолжить расследование",
            connectionError: "Ошибка связи",
            connectionErrorTitle: "Не удалось проверить обвинение",
            connectionErrorText: "Проверьте, запущен ли сервер, и попробуйте снова.",
            loadErrorTitle: "Не удалось загрузить дело",
            loadErrorText: "Запустите сервер игры и обновите страницу.",
            areas: [
              { title: "Напольные часы", description: "Старые часы не работали десять лет. Кто-то заставил их пробить лишний удар вручную." },
              { title: "Открытое окно", description: "Следы на снегу ведут только от окна к лесу. Никто не подходил к окну снаружи." },
              { title: "Камин", description: "На камне осталось крошечное пятно крови. Оружия поблизости нет." },
              { title: "Семейная фотография", description: "На обороте снимка Виктор оставил короткую подпись о настоящем имени Элизы." },
              { title: "Карманные часы", description: "Стрелки остановили позже смерти Ардена. 23:17 — поддельное время убийства." },
            ],
            suspects: {
              eliza: { name: "Элиза Арден", role: "Дочь жертвы", motive: "Арден лишал её наследства и держал её в тени.", alibi: "Говорит, что весь вечер была в библиотеке." },
              mark: { name: "Марк Вейл", role: "Деловой партнёр", motive: "Арден готовился разоблачить его махинации.", alibi: "Утверждает, что был в винном погребе." },
              sofia: { name: "София Ланге", role: "Бывшая жена", motive: "Арден двадцать лет назад похитил её дочь и подделал документы.", alibi: "Её визит в отель был не случайным." },
              thomas: { name: "Томас Рид", role: "Управляющий отелем", motive: "Знает все тайные проходы и замки.", alibi: "Первым обнаружил тело и выглядел слишком удобно." },
              may: { name: "Мэй Холл", role: "Горничная", motive: "Последней видела Ардена живым и принесла ему вино.", alibi: "Считает, что не может читать по-французски." },
            },
            clues: [
              "Часы пробили одиннадцать ударов, а затем кто-то вручную добавил двенадцатый. Время смерти было сфабриковано.",
              "Следы на снегу ведут не к окну, а от него — значит, убийца не выходил наружу.",
              "Пятно крови на камине размером с ноготь указывает на краткое, спешное действие.",
              "На обратной стороне старой фотографии написано: «Настоящее имя — Элиза Ланге».",
              "Арден хотел оставить подсказку: подделка касалась не только документов, но и личности Элизы.",
            ],
          },
          en: {
            title: "The Last Chime at 11:17",
            windowLabel: "Detective game window",
            window: "Detective Agency · New Case",
            settings: "Settings",
            settingsDescription: "Game preferences",
            closeSettings: "Close",
            profile: "User profile",
            language: "Language",
            logo: "🕰 The Last Chime",
            account: "Account",
            accountName: "Detective",
            accountRole: "Player",
            guestsButton: "Hotel guests",
            playButton: "Play game",
            detective: "Detective",
            dialogueLabel: "Character dialogue",
            placeholderDialogue: "1",
            blackScene: "Game scene",
            notebook: "Clue notebook",
            notebookButton: "Clue notebook",
            emptyClues: "Start the investigation to collect clues.",
            signIn: "Sign in",
            signUp: "Create an account",
            authIntro: "Sign in or create an account. Your investigation progress will be saved.",
            username: "Username",
            email: "Email address",
            englishLevel: "English level",
            password: "Password (at least 12 characters)",
            loginButton: "Sign in",
            registerButton: "Create account",
            switchRegister: "New here? Create an account",
            switchLogin: "Already have an account? Sign in",
            emailChecking: "Checking address…",
            emailInvalid: "Enter a valid email address.",
            emailTaken: "This email is already registered.",
            emailAvailable: "This email is available ✓",
            signOut: "Sign out",
            authFailed: "The request failed. Check your details and try again.",
            weakPassword: "Use a password with 12 to 128 characters.",
            usernameTaken: "This username is already in use.",
            authenticated: "Signed in",
            continueGame: "Continue investigation",
            findThreeClues: "Find at least three clues to unlock the puzzles.",
            solveChallenge: "Solve the puzzle",
            challengeTitle: "Detective challenge",
            answerPlaceholder: "Your answer",
            checkAnswer: "Check answer",
            retryLater: "Try again later",
            challengePassed: "Correct! The next part of the investigation is now open.",
            challengeFailed: "Not correct yet. Your progress is saved, so you can try again later.",
            nextChallenge: "Continue",
            finalChallenge: "The puzzles are solved. You can now accuse a suspect.",
            gameCompleted: "Case complete. Your progress has been saved.",
            noGame: "Sign in to start the game.",
            csrfError: "Your session has expired. Please sign in again.",
            challengePrompts: [
              "The clock struck eleven times, then one extra strike by hand. How many strikes did the guests hear in total?",
              "The old photograph shows Eliza's real name. What is her real family name?",
            ],
            challengeQuestion: "Question",
            resumeChallenge: "Resume challenge",
            logoutError: "Could not end the session. Please try again.",
            restore: "Restore game",
            minimize: "Minimize game",
            noCase: "Case not started",
            progress: (found, total) => `11:17 PM · Clues found: ${found}/${total}`,
            caseNumber: "Case No. 2317",
            introTitle: "The Last Chime at 11:17",
            intro: "A snowstorm has trapped you in an old country hotel. The owner has been found dead in his study, and the clock struck a time that should never have happened.",
            storm: "SNOWSTORM · 11:17 PM",
            startHint: "Start the investigation. Search the study, collect clues, and speak with the guests.",
            start: "Start investigation",
            room: "Victor Arden's study",
            inspectRoom: "Victor Arden's study",
            inspectHint: "Choose an object to examine. Every clue you find will be added to your journal.",
            lockedRoom: "LOCKED STUDY · SNOW OUTSIDE",
            talkGuests: "Speak with the guests",
            guests: "Hotel guests",
            chooseGuest: "Who will you question?",
            guestHint: "Five guests are still in the hotel. Choose someone to hear their account of the night.",
            talk: "Talk",
            journal: "Detective's journal",
            collectedClues: "Clues collected",
            journalHint: "Notes you made while searching the study.",
            emptyJournal: "Your journal is empty. Return to the study and examine the objects.",
            accuseReady: "Choose a suspect",
            inspectLabel: "Searching the study",
            continue: "Continue searching",
            interview: "Interview",
            motive: "Motive",
            accusePerson: "Accuse this person",
            backToGuests: "Back to the guests",
            notEnoughTitle: "Not enough evidence",
            notEnoughText: "Examine at least three objects in the study before accusing anyone.",
            backToScene: "Return to the study",
            checking: "Checking your theory…",
            revealed: "Case solved",
            wrongTitle: "Wrong conclusion",
            wrongMessage: "That conclusion is too quick. The key is not only who knew about the crime, but also who knew Eliza's real identity and Arden's secret.",
            wrongSummary: "The truth is hidden in a false family history and in the way Victor Arden controlled the story of his past.",
            rightTitle: "Correct conclusion",
            rightMessage: "Sophia Lange is the killer. She knew the truth about her stolen daughter and used the false clock chime to hide the real time of death.",
            rightSummary: "Arden did not die at 11:17 PM. He died much earlier. Sophia knew the truth because she was part of the family secret hidden by the hotel.",
            restart: "Play again",
            continueInvestigation: "Continue investigation",
            connectionError: "Connection error",
            connectionErrorTitle: "Could not check your accusation",
            connectionErrorText: "Check that the game server is running, then try again.",
            loadErrorTitle: "Could not load the case",
            loadErrorText: "Start the game server and refresh the page.",
            areas: [
              { title: "Grandfather clock", description: "The old clock had been broken for ten years. Someone made it strike one extra time by hand." },
              { title: "Open window", description: "The footprints in the snow lead away from the window and towards the forest. No one walked up to the window." },
              { title: "Fireplace", description: "A tiny spot of blood remains on the stone. The weapon is nowhere to be seen." },
              { title: "Family photograph", description: "On the back, Victor left a short note about Eliza's real name." },
              { title: "Pocket watch", description: "The hands were stopped after Arden died. 11:17 PM was a false time of death." },
            ],
            suspects: {
              eliza: { name: "Eliza Arden", role: "The victim's daughter", motive: "Arden planned to cut her out of his will and keep her in the dark.", alibi: "She says she spent the evening in the library." },
              mark: { name: "Mark Vale", role: "Business partner", motive: "Arden was preparing to expose his fraud.", alibi: "He says he was in the wine cellar." },
              sofia: { name: "Sophia Lange", role: "Former wife", motive: "Twenty years ago, Arden took her daughter and changed the records.", alibi: "Her visit to the hotel was no accident." },
              thomas: { name: "Thomas Reed", role: "Hotel manager", motive: "He knows every hidden passage and old lock.", alibi: "He found the body first, which looks suspiciously convenient." },
              may: { name: "May Hall", role: "Housekeeper", motive: "She was the last person to see Arden alive and brought him wine.", alibi: "She says she cannot read French." },
            },
            clues: [
              "The clock struck eleven times, then someone added a twelfth strike by hand. The time of death was staged.",
              "The footprints lead away from the window, not towards it. The killer did not escape outside.",
              "A tiny spot of blood on the fireplace suggests a brief, rushed action.",
              "The back of the old photograph reads: “Her real name is Eliza Lange.”",
              "Arden left a clue: the lie was not only about documents, but also about Eliza's identity.",
            ],
          },
        };

        const areas = copy.ru.areas;
        const t = () => copy[state.language];

        function setLanguage(language) {
          const accountName = document.getElementById("account-name");
          const accountRole = document.getElementById("account-role");
          const profileName = accountName.textContent;
          const profileEmail = accountRole.textContent;
          state.language = language === "en" ? "en" : "ru";
          localStorage.setItem("game-language", state.language);
          document.documentElement.lang = state.language;
          document.title = t().title;
          document.getElementById("window-title").textContent = t().window;
          document.getElementById("settings-heading").textContent = t().settings;
          document.getElementById("settings-description").textContent = t().settingsDescription;
          document.getElementById("close-settings").textContent = t().closeSettings;
          openSettings.setAttribute("aria-label", t().settings);
          openSettings.title = t().settings;
          document.getElementById("language-label").textContent = t().language;
          document.getElementById("game-window").setAttribute("aria-label", t().windowLabel);
          document.getElementById("game-logo").textContent = t().logo;
          languageSelect.setAttribute("aria-label", t().language);
          languageSelect.options[0].textContent = state.language === "en" ? "Russian" : "Русский";
          languageSelect.options[1].textContent = state.language === "en" ? "English" : "Английский";
          languageSelect.value = state.language;
          document.getElementById("account-panel").setAttribute("aria-label", t().account);
          document.getElementById("account-heading").textContent = t().account;
          document.querySelector(".account-profile").setAttribute("aria-label", t().profile);
          accountLogout.textContent = t().signOut;
          accountGuests.disabled = !state.user;
          accountNotebookButton.disabled = !state.user;
          accountStartGame.disabled = !state.user;
          accountStartGame.textContent = t().playButton;
          document.getElementById("account-guests").textContent = t().guestsButton;
          accountNotebookButton.textContent = t().notebookButton;
          document.getElementById("notebook-heading").textContent = t().notebook;
          document.getElementById("minimize-game").setAttribute("aria-label", t().minimize);
          document.getElementById("minimize-game").title = t().minimize;
          restoreGame.textContent = t().restore;
          renderJournal();
          updateStatus();
          if (!state.user) showAuth(state.authMode);
          else if (state.started) renderView();
          else showLanding();
          accountName.textContent = profileName;
          accountRole.textContent = profileEmail;
        }

        function text(parent, tag, value, className) {
          const node = document.createElement(tag);
          node.textContent = value;
          if (className) node.className = className;
          parent.append(node);
          return node;
        }

        function showAuth(mode = state.authMode, errorMessage = "") {
          state.authMode = mode;
          state.user = null;
          state.started = false;
          accountLogout.hidden = true;
          document.getElementById("account-name").textContent = t().accountName;
          document.getElementById("account-role").textContent = t().accountRole;
          updateStatus();
          setScreen(t().account, mode === "register" ? t().signUp : t().signIn, t().authIntro);

          const form = document.createElement("form");
          form.className = "auth-form";
          const emailInput = addField(form, "email", t().email, "email", true);
          emailInput.autocomplete = "email";
          emailInput.maxLength = 254;

          if (mode === "register") {
            const usernameInput = addField(form, "username", t().username, "text", true);
            usernameInput.autocomplete = "username";
            usernameInput.minLength = 3;
            usernameInput.maxLength = 32;

            const levelLabel = document.createElement("label");
            levelLabel.append(document.createTextNode(t().englishLevel));
            const levelSelect = document.createElement("select");
            levelSelect.name = "english_level";
            ["A1", "A2", "B1", "B2", "C1", "C2"].forEach((level) => {
              const option = document.createElement("option");
              option.value = level;
              option.textContent = level;
              option.selected = level === "B2";
              levelSelect.append(option);
            });
            levelLabel.append(levelSelect);
            form.append(levelLabel);
          }

          const passwordInput = addField(form, "password", t().password, "password", true);
          passwordInput.autocomplete = mode === "register" ? "new-password" : "current-password";
          passwordInput.minLength = mode === "register" ? 12 : 1;
          passwordInput.maxLength = 128;

          let emailFeedback = null;
          if (mode === "register") {
            emailFeedback = text(form, "div", "", "field-feedback");
            emailFeedback.setAttribute("role", "status");
            let checkNumber = 0;
            let checkTimer;
            emailInput.addEventListener("input", () => {
              const currentCheck = ++checkNumber;
              clearTimeout(checkTimer);
              emailFeedback.className = "field-feedback";
              emailFeedback.textContent = t().emailChecking;
              checkTimer = setTimeout(async () => {
                try {
                  const query = new URLSearchParams({ email: emailInput.value });
                  const response = await fetch(`/api/auth/email-availability?${query}`);
                  if (!response.ok) throw new Error(`Email check failed: ${response.status}`);
                  const result = await response.json();
                  if (currentCheck !== checkNumber) return;
                  emailFeedback.classList.add(result.available ? "success" : "error");
                  emailFeedback.textContent = result.valid
                    ? result.available ? t().emailAvailable : t().emailTaken
                    : t().emailInvalid;
                } catch (error) {
                  if (currentCheck === checkNumber) {
                    emailFeedback.classList.add("error");
                    emailFeedback.textContent = t().authFailed;
                  }
                  console.error(error);
                }
              }, 350);
            });
          }

          const errorBox = text(form, "p", errorMessage, "auth-error");
          errorBox.setAttribute("role", "alert");
          const submit = text(
            form,
            "button",
            mode === "register" ? t().registerButton : t().loginButton,
            "start-button"
          );
          submit.type = "submit";
          const switchButton = text(
            form,
            "button",
            mode === "register" ? t().switchLogin : t().switchRegister,
            "action-button"
          );
          switchButton.type = "button";
          switchButton.addEventListener("click", () => {
            showAuth(mode === "register" ? "login" : "register");
          });
          form.addEventListener("submit", async (event) => {
            event.preventDefault();
            submit.disabled = true;
            errorBox.textContent = "";
            const payload = {
              email: emailInput.value.trim(),
              password: passwordInput.value,
            };
            if (mode === "register") {
              payload.username = form.elements.username.value.trim();
              payload.english_level = form.elements.english_level.value;
            }
            try {
              const response = await fetch(
                mode === "register" ? "/api/auth/register" : "/api/auth/login",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }
              );
              const result = await response.json();
              if (!response.ok) {
                errorBox.textContent = authErrorMessage(result.detail);
                return;
              }
              state.csrfToken = result.csrf_token;
              state.user = result.user;
              await openUserGame();
            } catch (error) {
              errorBox.textContent = t().authFailed;
              console.error(error);
            } finally {
              submit.disabled = false;
            }
          });
          screen.append(form);

          function addField(parent, name, labelText, type, required) {
            const label = document.createElement("label");
            label.append(document.createTextNode(labelText));
            const input = document.createElement("input");
            input.name = name;
            input.type = type;
            input.required = required;
            label.append(input);
            parent.append(label);
            return input;
          }
        }

        function authErrorMessage(detail) {
          const code = detail && typeof detail === "object" ? detail.code : "";
          if (code === "email_taken") return t().emailTaken;
          if (code === "username_taken") return t().usernameTaken;
          if (code === "password") return t().weakPassword;
          if (code === "invalid_credentials") return t().authFailed;
          return detail && detail.message ? detail.message : t().authFailed;
        }

        function updateAccount(user) {
          state.user = user;
          document.getElementById("account-name").textContent = user.username;
          const accountEmail = document.getElementById("account-role");
          accountEmail.textContent = user.email;
          accountEmail.title = user.email;
          accountLogout.hidden = false;
          updateStatus();
        }

        async function apiFetch(url, options = {}) {
          const headers = new Headers(options.headers || {});
          if (options.method && options.method !== "GET" && state.csrfToken) {
            headers.set("X-CSRF-Token", state.csrfToken);
          }
          return fetch(url, { ...options, headers });
        }

        async function openUserGame() {
          const response = await apiFetch("/api/game");
          if (!response.ok) throw new Error(`Could not load game: ${response.status}`);
          state.game = await response.json();
          state.stage = state.game.progress.stage;
          state.clues = new Set(state.game.progress.clues);
          state.started =
            !state.game.progress.completed &&
            (state.stage > 0 || state.clues.size > 0);
          state.view = "scene";
          updateAccount(state.user);
          if (state.game.progress.completed) {
            setScreen(t().caseNumber, t().gameCompleted, t().gameCompleted);
          } else {
            renderView();
          }
        }

        function button(parent, label, action, value) {
          const node = text(parent, "button", label, "action-button");
          node.type = "button";
          node.dataset.action = action;
          if (value !== undefined) node.dataset.value = value;
          return node;
        }

        function setScreen(kicker, heading, description) {
          screen.replaceChildren();
          text(screen, "div", kicker, "scene-kicker");
          text(screen, "h2", heading, "scene-title");
          if (description) text(screen, "p", description, "scene-copy");
        }

        function addNovelDialogue(speaker, portrait = "🕵️") {
          let stage = screen.querySelector(".novel-stage");
          if (!stage) {
            stage = document.createElement("div");
            stage.className = "novel-stage";
            stage.setAttribute("aria-label", t().blackScene);
            screen.append(stage);
          }
          const panel = document.createElement("section");
          panel.className = "novel-dialogue";
          panel.setAttribute("aria-label", `${speaker} — ${t().dialogueLabel}`);
          const image = text(panel, "div", portrait, "novel-portrait");
          image.setAttribute("aria-hidden", "true");
          const copyPanel = document.createElement("div");
          copyPanel.className = "novel-dialogue-copy";
          text(copyPanel, "h3", speaker, "novel-speaker");
          text(copyPanel, "p", t().placeholderDialogue, "novel-line");
          panel.append(copyPanel);
          stage.append(panel);
        }

        function updateStatus() {
          status.textContent = state.started
            ? t().progress(state.clues.size, areas.length)
            : t().noCase;
          accountGuests.disabled = !state.user;
          accountNotebookButton.disabled = !state.user;
          accountStartGame.disabled = !state.user;
          accountGuests.classList.toggle("active", state.view === "suspects");
          accountNotebookButton.classList.toggle("active", state.view === "journal");
          renderJournal();
        }

        function renderJournal() {
          accountClues.replaceChildren();
          if (state.clues.size === 0) {
            text(accountClues, "li", t().emptyClues, "account-empty");
            return;
          }
          state.clues.forEach((index) => {
            const entry = document.createElement("li");
            text(entry, "strong", t().areas[index].title);
            text(entry, "span", t().clues[index]);
            accountClues.append(entry);
          });
        }

        function showScene() {
          setScreen(t().room, t().inspectRoom, "");
          addNovelDialogue(t().detective);
          if (state.stage < 2) {
            button(screen, state.stage === 0 ? t().solveChallenge : t().resumeChallenge, "challenge");
          } else {
            button(screen, t().talkGuests, "view", "suspects");
          }
        }

        function showSuspects() {
          if (!state.started) return showLanding();
          setScreen(t().guests, t().chooseGuest, t().guestHint);
          const list = document.createElement("div");
          list.className = "game-list";
          state.game.suspects.forEach((suspect, index) => {
            const details = t().suspects[suspect.id];
            const row = document.createElement("div");
            row.className = "game-list-item";
            text(row, "strong", `${details.name} · ${details.role}`);
            text(row, "p", details.alibi);
            button(row, t().talk, "interview", index);
            list.append(row);
          });
          screen.append(list);
        }

        function showJournal() {
          setScreen(
            t().notebook,
            t().collectedClues,
            state.clues.size ? t().journalHint : t().emptyJournal
          );
          const list = document.createElement("div");
          list.className = "game-list";
          state.clues.forEach((index) => {
            const entry = document.createElement("div");
            entry.className = "game-list-item";
            text(entry, "strong", t().areas[index].title);
            text(entry, "p", t().clues[index]);
            list.append(entry);
          });
          if (state.clues.size) screen.append(list);
          button(screen, t().backToScene, "view", "scene");
        }

        function showLanding() {
          setScreen(t().caseNumber, t().introTitle, "");
          addNovelDialogue(t().detective);
        }

        function renderView() {
          if (!state.started) return showLanding();
          if (state.view === "suspects") return showSuspects();
          if (state.view === "journal") return showJournal();
          showScene();
        }

        async function showInspection(index) {
          try {
            const response = await apiFetch(`/api/game/clues/${index}`, {
              method: "POST",
            });
            if (response.status === 401) {
              state.csrfToken = "";
              showAuth("login", t().csrfError);
              return;
            }
            if (!response.ok) throw new Error(`Could not save clue: ${response.status}`);
            const progress = await response.json();
            state.clues = new Set(progress.clues);
            state.stage = progress.stage;
            updateStatus();
            setScreen(t().inspectLabel, t().areas[index].title, t().areas[index].description);
            addNovelDialogue(t().detective);
            text(screen, "div", t().clues[index], "game-result");
            button(screen, t().continue, "view", "scene");
          } catch (error) {
            setScreen(t().connectionError, t().authFailed, t().authFailed);
            console.error(error);
          }
        }

        function showInterview(index) {
          const suspect = state.game.suspects[index];
          const details = t().suspects[suspect.id];
          setScreen(t().interview, details.name, details.role);
          const portraits = {
            eliza: "👩🏻",
            mark: "🧔🏻",
            sofia: "👩🏼",
            thomas: "🧑🏻",
            may: "👩🏽",
          };
          addNovelDialogue(details.name, portraits[suspect.id] || "👤");
          text(screen, "div", `${t().motive}: ${details.motive}`, "game-result");
          const actions = document.createElement("div");
          actions.className = "action-grid";
          if (state.stage >= 2) {
            button(actions, t().accusePerson, "accuse", suspect.id);
          } else {
            button(actions, t().solveChallenge, "challenge");
          }
          button(actions, t().backToGuests, "view", "suspects");
          screen.append(actions);
        }

        async function showChallenge() {
          try {
            const response = await apiFetch("/api/game/challenge");
            if (response.status === 401) {
              state.csrfToken = "";
              showAuth("login", t().csrfError);
              return;
            }
            if (!response.ok) throw new Error(`Could not load challenge: ${response.status}`);
            const challenge = await response.json();
            if (challenge.complete) {
              state.stage = challenge.stage;
              state.view = "suspects";
              renderView();
              return;
            }

            setScreen(t().challengeTitle, t().challengeQuestion, t().challengePrompts[challenge.stage]);
            const form = document.createElement("form");
            form.className = "auth-form";
            const answerInput = document.createElement("input");
            answerInput.name = "answer";
            answerInput.type = "text";
            answerInput.required = true;
            answerInput.maxLength = 100;
            answerInput.placeholder = t().answerPlaceholder;
            answerInput.setAttribute("aria-label", t().answerPlaceholder);
            form.append(answerInput);
            const feedback = text(form, "p", "", "game-result");
            feedback.setAttribute("role", "status");
            const submit = text(form, "button", t().checkAnswer, "start-button");
            submit.type = "submit";
            const later = text(form, "button", t().retryLater, "action-button");
            later.type = "button";
            later.addEventListener("click", showScene);
            form.addEventListener("submit", async (event) => {
              event.preventDefault();
              submit.disabled = true;
              try {
                const answerResponse = await apiFetch("/api/game/answer", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ answer: answerInput.value }),
                });
                if (!answerResponse.ok) throw new Error(`Could not check answer: ${answerResponse.status}`);
                const result = await answerResponse.json();
                if (!result.correct) {
                  feedback.classList.add("wrong");
                  feedback.textContent = t().challengeFailed;
                  submit.disabled = false;
                  return;
                }

                state.stage = result.progress.stage;
                updateStatus();
                form.replaceChildren();
                feedback.className = "game-result";
                feedback.textContent = t().challengePassed;
                const next = text(form, "button", t().nextChallenge, "start-button");
                next.type = "button";
                next.addEventListener("click", () => {
                  if (state.stage >= 2) {
                    state.view = "suspects";
                    renderView();
                  } else {
                    showChallenge();
                  }
                });
              } catch (error) {
                feedback.classList.add("wrong");
                feedback.textContent = error.message.includes("403")
                  ? t().csrfError
                  : t().authFailed;
                submit.disabled = false;
                console.error(error);
              }
            });
            screen.append(form);
          } catch (error) {
            setScreen(t().connectionError, t().connectionErrorTitle, t().connectionErrorText);
            console.error(error);
          }
        }

        async function accuse(suspectId) {
          if (state.stage < 2) {
            setScreen(t().notEnoughTitle, t().notEnoughTitle, t().notEnoughText);
            button(screen, t().backToScene, "view", "scene");
            return;
          }

          setScreen(t().revealed, t().checking, "");
          try {
            const response = await apiFetch(
              `/api/accuse/${encodeURIComponent(suspectId)}`,
              { method: "POST" }
            );
            if (response.status === 401) {
              state.csrfToken = "";
              showAuth("login", t().csrfError);
              return;
            }
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const verdict = await response.json();
            setScreen(t().revealed, verdict.correct ? t().rightTitle : t().wrongTitle, verdict.correct ? t().rightMessage : t().wrongMessage);
            text(screen, "div", verdict.correct ? t().rightSummary : t().wrongSummary, `game-result${verdict.correct ? "" : " wrong"}`);
            if (verdict.correct) {
              state.view = "scene";
              state.started = false;
              state.game.progress = verdict.progress;
              updateStatus();
              state.game.progress.completed = true;
              const restart = button(screen, t().restart, "restart");
              restart.className = "start-button";
              restart.disabled = !state.game;
            } else {
              button(screen, t().continueInvestigation, "view", "suspects");
            }
          } catch (error) {
            setScreen(t().connectionError, t().connectionErrorTitle, t().connectionErrorText);
            console.error(error);
          }
        }

        screen.addEventListener("click", async (event) => {
          const target = event.target.closest("button[data-action]");
          if (!target) return;
          const { action, value } = target.dataset;
          if (action === "start") {
            state.started = true;
            state.view = "scene";
            updateStatus();
            renderView();
          } else if (action === "restart") {
            target.disabled = true;
            try {
              const response = await apiFetch("/api/game/restart", { method: "POST" });
              if (!response.ok) throw new Error(`Could not restart game: ${response.status}`);
              const progress = await response.json();
              state.stage = progress.stage;
              state.clues = new Set(progress.clues);
              state.started = true;
              state.view = "scene";
              updateStatus();
              renderView();
            } catch (error) {
              target.disabled = false;
              setScreen(t().connectionError, t().authFailed, t().authFailed);
              console.error(error);
            }
          } else if (action === "view") {
            state.view = value;
            updateStatus();
            renderView();
          } else if (action === "inspect") {
            showInspection(Number(value));
          } else if (action === "interview") {
            showInterview(Number(value));
          } else if (action === "challenge") {
            showChallenge();
          } else if (action === "accuse") {
            accuse(value);
          }
        });

        accountGuests.addEventListener("click", () => {
          if (!state.game) return;
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          state.started = true;
          state.view = "suspects";
          updateStatus();
          renderView();
        });

        accountNotebookButton.addEventListener("click", () => {
          if (!state.game) return;
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          state.started = true;
          state.view = "journal";
          updateStatus();
          renderView();
        });

        accountStartGame.addEventListener("click", () => {
          if (!state.game) return;
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          if (state.game.progress.completed) {
            setScreen(t().caseNumber, t().gameCompleted, t().gameCompleted);
            const restart = button(screen, t().restart, "restart");
            restart.className = "start-button";
            gameWindow.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return;
          }
          state.started = true;
          state.view = "scene";
          updateStatus();
          renderView();
          gameWindow.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });

        accountLogout.addEventListener("click", async () => {
          accountLogout.disabled = true;
          try {
            const response = await apiFetch("/api/auth/logout", { method: "POST" });
            if (!response.ok) throw new Error(`Logout failed: ${response.status}`);
            state.csrfToken = "";
            state.user = null;
            state.game = null;
            state.clues.clear();
            state.stage = 0;
            state.started = false;
            showAuth("login");
          } catch (error) {
            setScreen(t().connectionError, t().logoutError, t().logoutError);
            console.error(error);
          } finally {
            accountLogout.disabled = false;
          }
        });

        document.getElementById("minimize-game").addEventListener("click", () => {
          gameWindow.classList.add("minimized");
          restoreGame.hidden = false;
        });

        restoreGame.addEventListener("click", () => {
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
        });

        languageSelect.addEventListener("change", () => setLanguage(languageSelect.value));

        openSettings.addEventListener("click", () => settingsDialog.showModal());
        closeSettings.addEventListener("click", () => settingsDialog.close());
        settingsDialog.addEventListener("click", (event) => {
          if (event.target === settingsDialog) settingsDialog.close();
        });

        async function initialize() {
          try {
            const response = await fetch("/api/auth/me");
            if (!response.ok) throw new Error(`Could not check sign-in: ${response.status}`);
            const account = await response.json();
            if (!account.authenticated) {
              showAuth("login");
              return;
            }
            state.csrfToken = account.csrf_token;
            state.user = account.user;
            await openUserGame();
          } catch (error) {
            showAuth("login", t().authFailed);
            console.error(error);
          }
        }

        setLanguage(state.language);
        initialize();
      })();
