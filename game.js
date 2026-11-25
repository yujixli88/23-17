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
        const accountVocabularyButton = document.getElementById("account-vocabulary-button");
        const accountStartGame = document.getElementById("account-start-game");
        const accountLogout = document.getElementById("account-logout");
        const profileOpen = document.getElementById("profile-open");
        const profileToggle = document.getElementById("profile-toggle");
        const accountPanel = document.getElementById("account-panel");
        const accountBackdrop = document.getElementById("account-backdrop");
        const profileDrawerClose = document.getElementById("profile-drawer-close");
        const profileForm = document.getElementById("profile-settings");
        const profileDialog = document.getElementById("profile-dialog");
        const profileNameInput = document.getElementById("profile-display-name");
        const profileFileInput = document.getElementById("profile-avatar-file");
        const profileAvatarPreview = document.getElementById("profile-avatar-preview");
        const profileFeedback = document.getElementById("profile-feedback");
        const accountAvatar = document.getElementById("account-avatar");
        const backgroundMusic = document.getElementById("background-music");
        const musicToggle = document.getElementById("music-toggle");
        const homeMenuButton = document.getElementById("home-menu-button");
        let musicStatusKey = "";
        const accountClues = document.getElementById("account-clues");
        const restoreGame = document.getElementById("restore-game");
        const storySources = window.lastChimeStories;
        if (!storySources || !storySources.ru || !storySources.en) {
          throw new Error("The Russian and English story files must load before the game.");
        }

        function storySegment(language, startMarker, endMarker = startMarker) {
          const story = storySources[language];
          const start = story.findIndex((entry) => entry.text.includes(startMarker));
          const end = endMarker === null
            ? story.length - 1
            : story.findIndex(
              (entry, index) => index >= start && entry.text.includes(endMarker)
            );
          if (start < 0 || end < start) {
            throw new Error(`Could not find the ${language} story segment: ${startMarker}`);
          }

          const seenLines = new Set();
          return story.slice(start, end + 1).flatMap((entry) => {
            const line = entry.text.replace(/^[\s\uFE0E\uFE0F]+/u, "").trim();
            const normalizedLine = line.replace(/\s+/gu, " ").toLocaleLowerCase(language);
            if (!line || seenLines.has(normalizedLine)) return [];
            seenLines.add(normalizedLine);
            const sourceSpeaker = entry.speaker.trim();
            const isNarrator = !sourceSpeaker
              || /^(voice|at\s+\d|в\s+\d|голос|👥\s*suspects|🔎)/iu.test(sourceSpeaker);
            const speaker = isNarrator
              ? language === "en" ? "Narrator" : "Рассказчик"
              : sourceSpeaker;
            const portraits = {
              "Detective": "🕵️", "Детектив": "🕵️",
              "Eliza": "👩🏻", "Элиза": "👩🏻",
              "Sophia": "👩🏼", "София": "👩🏼",
              "May": "👩🏽", "Мэй": "👩🏽",
              "Thomas": "🧑🏻", "Томас": "🧑🏻",
              "Mark": "🧔🏻", "Марк": "🧔🏻",
              "Arden": "🧔🏻", "Арден": "🧔🏻",
            };
            return [{
              speaker,
              portrait: portraits[speaker] || "🌨️",
              line,
            }];
          });
        }

        const state = {
          game: null,
          started: false,
          clues: new Set(),
          view: "scene",
          stage: 0,
          csrfToken: "",
          user: null,
          authMode: "menu",
          language: localStorage.getItem("game-language") === "en" ? "en" : "ru",
        };

        const copy = {
          ru: {
            title: "Последний звонок в 23:17",
            menuIntro: "Раскройте тайну последнего звонка в старом загородном отеле.",
            mainMenu: "Главное меню",
            startRequiresSignIn: "Войдите или зарегистрируйтесь, чтобы начать игру.",
            menuGuest: "Выберите, с чего начать расследование.",
            menuWelcome: "Продолжите расследование или настройте профиль.",
            menuSignIn: "Войти",
            menuRegister: "Регистрация",
            menuStart: "Начать игру",
            menuContinue: "Продолжить игру",
            menuProfile: "Профиль",
            menuLogout: "Выйти",
            backToMenu: "Назад в главное меню",
            windowLabel: "Игровое окно детективного квеста",
            window: "Детективное агентство · новое дело",
            settings: "Настройки",
            settingsDescription: "Параметры игры",
            closeSettings: "Закрыть",
            musicVolume: "Громкость музыки",
            musicPlay: "Включить",
            musicPause: "Выключить",
            musicBlocked: "Нажмите «Включить», чтобы запустить музыку.",
            musicError: "Не удалось загрузить музыкальный файл.",
            profile: "Профиль пользователя",
            profileName: "Никнейм",
            profileAvatar: "Фото профиля (изображение до 2 МБ)",
            profileSave: "Сохранить профиль",
            closeProfile: "Закрыть",
            profileImageError: "Выберите PNG, JPEG, GIF или WebP размером не более 2 МБ.",
            profileSaveError: "Не удалось сохранить профиль на сервере.",
            language: "Язык",
            logo: "🕰 Последний звонок в 23:17",
            account: "Аккаунт",
            accountName: "Детектив",
            accountRole: "Игрок",
            guestsButton: "Гости отеля",
            playButton: "Играть",
            detective: "Детектив",
            dialogueLabel: "Реплика персонажа",
            dialogueContinue: "Далее",
            chooseAction: "Выберите следующее действие",
            placeholderDialogue: "1",
            blackScene: "Сцена игры",
            notebook: "Блокнот улик",
            notebookButton: "Блокнот улик",
            vocabularyButton: "Crime vocabulary",
            vocabularyKicker: "English practice",
            vocabularyTitle: "Crime vocabulary",
            vocabularyIntro: "Train your detective English with vocabulary, collocations and a mini mystery.",
            showAnswer: "Show answer key",
            backToGame: "Back to investigation",
            vocabularyError: "Could not load the vocabulary practice.",
            loginRateLimited: "Too many login attempts. Wait a little and try again.",
            emptyClues: "Начните расследование, чтобы собирать улики.",
            signIn: "Войти",
            signUp: "Создать аккаунт",
            authIntro: "Войдите или создайте аккаунт. Прогресс расследования будет сохранён.",
            username: "Имя пользователя",
            email: "Электронная почта",
            loginIdentifier: "Почта или имя пользователя",
            englishLevel: "Уровень английского",
            password: "Пароль",
            passwordRuleLength: "От 10 до 128 символов",
            passwordRuleLowercase: "Строчная буква",
            passwordRuleUppercase: "Заглавная буква",
            passwordRuleNumber: "Цифра",
            passwordRuleSymbol: "Специальный символ",
            passwordPersonalWarning: "Совет: не включайте имя пользователя или часть email до @.",
            loginButton: "Войти",
            registerButton: "Зарегистрироваться",
            switchRegister: "Нет аккаунта? Зарегистрируйтесь",
            switchLogin: "Уже есть аккаунт? Войдите",
            emailChecking: "Проверяем адрес…",
            emailInvalid: "Введите корректный адрес электронной почты.",
            emailTaken: "Этот адрес уже зарегистрирован.",
            emailAvailable: "Этот адрес свободен ✓",
            signOut: "Выйти",
            showProfile: "Открыть профиль",
            hideProfile: "Закрыть профиль",
            authFailed: "Не удалось выполнить запрос. Проверьте данные и повторите попытку.",
            weakPassword: "Пароль не соответствует требованиям.",
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
            roomMapLabel: "Интерактивная карта кабинета",
            found: "Найдено",
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
            examine: "Осмотреть",
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
            wrongMessage: "Это не вся правда. Разделите первый и смертельный удары и выясните, кто вошёл в кабинет после Софии.",
            wrongSummary: "Кровь на камине доказывает первый удар, но София ушла, пока Арден был ещё жив.",
            rightTitle: "Правильный вывод",
            rightMessage: "Мэй Холл нанесла смертельный удар. София ударила Ардена первой, но он был ещё жив. Томас помог скрыть следы.",
            rightSummary: "София призналась в первом ударе, Мэй — в смертельном, а Томас — в инсценировке побега. Элиза оказалась дочерью Софии.",
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
              mark: { name: "Марк Вейл", role: "Деловой партнёр", motive: "Арден собирался раскрыть его финансовые махинации.", alibi: "Утверждает, что был в винном погребе, но камеры выключились на семь минут." },
              sofia: { name: "София Ланге", role: "Бывшая жена", motive: "Арден разрушил её репутацию, а двадцать девять лет назад похитил её дочь.", alibi: "Её визит в отель был не случайным." },
              thomas: { name: "Томас Рид", role: "Управляющий отелем", motive: "Знает все тайные проходы и замки.", alibi: "Первым обнаружил тело и выглядел слишком удобно." },
              may: { name: "Мэй Холл", role: "Горничная", motive: "Её брата ложно обвинили в краже; он умер в тюрьме.", alibi: "Считает, что не может читать по-французски." },
            },
            clues: [
              "Часы пробили одиннадцать ударов, а затем кто-то вручную добавил двенадцатый. Время смерти было сфабриковано.",
              "Следы на снегу ведут не к окну, а от него — значит, убийца не выходил наружу.",
              "Пятно крови на камине оставил первый удар Софии. Арден пережил его, но позже Мэй ударила его снова.",
              "На обратной стороне старой фотографии написано: «Настоящее имя — Элиза Ланге».",
              "Арден хотел оставить подсказку: подделка касалась не только документов, но и личности Элизы.",
            ],
            openingDialogues: storySegment("ru", "Арден объявляет:", "На столе:"),
            studyDialogues: storySegment("ru", "Вскрытие показывает:"),
            clueDialogues: [
              storySegment("ru", "И тогда детектив возвращается к странному бою часов.", "И человек, который это сделал, должен был находиться рядом с ним ещё до 23:00."),
              storySegment("ru", "Он хотел, чтобы все поверили, будто убийца сбежал наружу."),
              storySegment("ru", "Причина смерти — сильный удар по голове.", "Размером буквально с ноготь."),
              storySegment("ru", "И тут детектив замечает одну совершенно крошечную деталь.", "То есть дочь Ардена — вовсе не Элиза Арден."),
              storySegment("ru", "часы жертвы остановились не в момент убийства."),
            ],
            interviewDialogues: {
              eliza: storySegment("ru", "1. Элиза Арден", "почти весь вечер."),
              mark: storySegment("ru", "2. Марк Вейл", "на семь минут."),
              sofia: storySegment("ru", "3. София Ланге", "что заслужил."),
              thomas: storySegment("ru", "4. Томас Рид", "Слишком удобно."),
              may: storySegment("ru", "5. Мэй Холл", "совершенно обычными буквами."),
            },
            revealDialogues: storySegment("ru", "К утру буря немного стихла.", null),
          },
          en: {
            title: "The Last Chime at 11:17 PM",
            menuIntro: "Uncover the mystery of the final chime at the old country hotel.",
            mainMenu: "Main menu",
            startRequiresSignIn: "Sign in or register to start the game.",
            menuGuest: "Choose how you would like to begin the investigation.",
            menuWelcome: "Continue the investigation or update your profile.",
            menuSignIn: "Sign in",
            menuRegister: "Register",
            menuStart: "Start game",
            menuContinue: "Continue game",
            menuProfile: "Profile",
            menuLogout: "Sign out",
            backToMenu: "Back to main menu",
            windowLabel: "Detective game window",
            window: "Detective Agency · New Case",
            settings: "Settings",
            settingsDescription: "Game preferences",
            closeSettings: "Close",
            musicVolume: "Music volume",
            musicPlay: "Play",
            musicPause: "Pause",
            musicBlocked: "Select Play to start the music.",
            musicError: "Could not load the music file.",
            profile: "User profile",
            profileName: "Nickname",
            profileAvatar: "Profile photo (image up to 2 MB)",
            profileSave: "Save profile",
            closeProfile: "Close",
            profileImageError: "Choose a PNG, JPEG, GIF, or WebP image no larger than 2 MB.",
            profileSaveError: "The profile could not be saved to the server.",
            language: "Language",
            logo: "🕰 The Last Chime at 11:17 PM",
            account: "Account",
            accountName: "Detective",
            accountRole: "Player",
            guestsButton: "Hotel guests",
            playButton: "Play game",
            detective: "Detective",
            dialogueLabel: "Character dialogue",
            dialogueContinue: "Continue",
            chooseAction: "Choose your next action",
            placeholderDialogue: "1",
            blackScene: "Game scene",
            notebook: "Clue notebook",
            notebookButton: "Clue notebook",
            vocabularyButton: "Crime vocabulary",
            vocabularyKicker: "English practice",
            vocabularyTitle: "Crime vocabulary",
            vocabularyIntro: "Train your detective English with vocabulary, collocations and a mini mystery.",
            showAnswer: "Show answer key",
            backToGame: "Back to investigation",
            vocabularyError: "Could not load the vocabulary practice.",
            emptyClues: "Start the investigation to collect clues.",
            loginRateLimited: "Too many login attempts. Wait a little and try again.",
            signIn: "Sign in",
            signUp: "Create an account",
            authIntro: "Sign in or create an account. Your investigation progress will be saved.",
            username: "Username",
            email: "Email address",
            loginIdentifier: "Email or username",
            englishLevel: "English level",
            password: "Password",
            passwordRuleLength: "10 to 128 characters",
            passwordRuleLowercase: "A lowercase letter",
            passwordRuleUppercase: "An uppercase letter",
            passwordRuleNumber: "A number",
            passwordRuleSymbol: "A special character",
            passwordPersonalWarning: "Tip: do not include your username or the part of your email before @.",
            loginButton: "Sign in",
            registerButton: "Create account",
            switchRegister: "New here? Create an account",
            switchLogin: "Already have an account? Sign in",
            emailChecking: "Checking address…",
            emailInvalid: "Enter a valid email address.",
            emailTaken: "This email is already registered.",
            emailAvailable: "This email is available ✓",
            signOut: "Sign out",
            showProfile: "Open profile",
            hideProfile: "Close profile",
            authFailed: "The request failed. Check your details and try again.",
            weakPassword: "The password does not meet the requirements.",
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
            introTitle: "The Last Chime at 11:17 PM",
            intro: "A snowstorm has trapped you in an old country hotel. The owner has been found dead in his study, and the clock struck a time that should never have happened.",
            storm: "SNOWSTORM · 11:17 PM",
            startHint: "Start the investigation. Search the study, collect clues, and speak with the guests.",
            start: "Start investigation",
            room: "Victor Arden's study",
            inspectRoom: "Victor Arden's study",
            inspectHint: "Choose an object to examine. Every clue you find will be added to your journal.",
            roomMapLabel: "Interactive study map",
            found: "Found",
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
            examine: "Examine",
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
            wrongMessage: "That is not the whole story. Separate the first blow from the fatal one and find out who entered the study after Sophia.",
            wrongSummary: "The blood on the fireplace points to the first blow, but Sophia left while Arden was still alive.",
            rightTitle: "Correct conclusion",
            rightMessage: "May Hall dealt the fatal blow. Sophia struck Arden first, but he was still alive. Thomas helped hide the evidence.",
            rightSummary: "Sophia admitted the first blow, May the fatal one, and Thomas the staged escape. Eliza was Sophia's daughter.",
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
              mark: { name: "Mark Vale", role: "Business partner", motive: "Arden was preparing to expose his financial fraud.", alibi: "He says he was in the wine cellar, but its cameras went dark for seven minutes." },
              sofia: { name: "Sophia Lange", role: "Former wife", motive: "Arden ruined her career, then stole her daughter twenty-nine years ago.", alibi: "Her visit to the hotel was no accident." },
              thomas: { name: "Thomas Reed", role: "Hotel manager", motive: "He knows every hidden passage and old lock.", alibi: "He found the body first, which looks suspiciously convenient." },
              may: { name: "May Hall", role: "Housekeeper", motive: "Her brother was falsely accused of theft and died in prison.", alibi: "She says she cannot read French." },
            },
            clues: [
              "The clock struck eleven times, then someone added a twelfth strike by hand. The time of death was staged.",
              "The footprints lead away from the window, not towards it. The killer did not escape outside.",
              "The blood on the fireplace came from Sophia's first blow. Arden survived it, but May struck him again later.",
              "The back of the old photograph reads: “Her real name is Eliza Lange.”",
              "Arden left a clue: the lie was not only about documents, but also about Eliza's identity.",
            ],
            openingDialogues: storySegment("en", "Arden announces:", "On the desk:"),
            studyDialogues: storySegment("en", "The autopsy reveals that Arden was not poisoned by the wine."),
            clueDialogues: [
              storySegment("en", "And then the detective returns to the strange chime of the clock.", "And whoever did it must have been near him before 11:00 PM."),
              storySegment("en", "He wanted everyone to believe the murderer had escaped outside."),
              storySegment("en", "The cause of death was a severe blow to the head.", "A tiny spot of blood, barely the size of a fingernail, was found on the fireplace."),
              storySegment("en", "And then the detective notices one incredibly tiny detail.", "In other words, Arden’s daughter is not Eliza Arden at all."),
              storySegment("en", "the victim’s watch did not stop at the moment of the murder."),
            ],
            interviewDialogues: {
              eliza: storySegment("en", "1. Eliza Arden", "entire evening."),
              mark: storySegment("en", "2. Mark Vale", "seven minutes."),
              sofia: storySegment("en", "3. Sophia Lange", "what he deserved."),
              thomas: storySegment("en", "4. Thomas Reed", "Far too convenient."),
              may: storySegment("en", "5. May Hall", "perfectly ordinary letters."),
            },
            revealDialogues: storySegment("en", "By morning, the storm had eased somewhat.", null),
          },
        };

        const areas = copy.ru.areas;
        const t = () => copy[state.language];

        function updateMusicControls() {
          const value = Math.round(backgroundMusic.volume * 100);
          document.querySelectorAll("[data-music-volume]").forEach((input) => {
            input.value = String(value);
            const output = document.querySelector(`output[for="${input.id}"]`);
            if (output) output.value = `${value}%`;
          });
          musicToggle.textContent = backgroundMusic.paused ? t().musicPlay : t().musicPause;
          musicToggle.setAttribute("aria-label", musicToggle.textContent);
          document.querySelectorAll(".music-status").forEach((status) => {
            status.textContent = musicStatusKey ? t()[musicStatusKey] : "";
          });
        }

        function setMusicVolume(value) {
          const volume = Math.min(1, Math.max(0, Number(value) / 100));
          backgroundMusic.volume = volume;
          localStorage.setItem("game-music-volume", String(Math.round(volume * 100)));
          localStorage.setItem("musicVolume", String(volume));
          updateMusicControls();
        }

        async function playMusic() {
          try {
            await backgroundMusic.play();
            musicStatusKey = "";
          } catch (error) {
            if (error.name === "AbortError") {
              updateMusicControls();
              return;
            }
            if (error.name === "NotAllowedError") {
              musicStatusKey = "musicBlocked";
            } else {
              musicStatusKey = "musicError";
              console.error(error);
            }
          }
          updateMusicControls();
        }

        function setMusicTrack(track) {
          const source = track === "game"
            ? "/static/audio/the_iron_pendulum.mp3"
            : "/static/audio/gemini_music.mp3";
          if (backgroundMusic.getAttribute("src") !== source) {
            backgroundMusic.src = source;
            backgroundMusic.load();
          }
          void playMusic();
        }

        document.addEventListener("input", (event) => {
          if (event.target.matches("[data-music-volume]")) {
            setMusicVolume(event.target.value);
          }
        });
        musicToggle.addEventListener("click", () => {
          if (backgroundMusic.paused) void playMusic();
          else backgroundMusic.pause();
        });
        backgroundMusic.addEventListener("play", updateMusicControls);
        backgroundMusic.addEventListener("pause", updateMusicControls);
        backgroundMusic.addEventListener("error", () => {
          musicStatusKey = "musicError";
          updateMusicControls();
        });
        const storedMusicVolume = localStorage.getItem("game-music-volume");
        const legacyMusicVolume = localStorage.getItem("musicVolume");
        const savedMusicVolume = storedMusicVolume !== null
          ? Number(storedMusicVolume)
          : legacyMusicVolume !== null
            ? Number(legacyMusicVolume) * 100
            : 50;
        setMusicVolume(Number.isFinite(savedMusicVolume) ? savedMusicVolume : 50);
        const resumeMusicOnInteraction = () => {
          if (backgroundMusic.paused) void playMusic();
        };
        document.addEventListener("pointerdown", resumeMusicOnInteraction, { once: true });
        document.addEventListener("keydown", resumeMusicOnInteraction, { once: true });

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
          document.getElementById("music-volume-label").textContent = t().musicVolume;
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
          profileOpen.setAttribute("aria-label", t().profile);
          profileToggle.setAttribute("aria-label", accountPanel.classList.contains("is-open") ? t().hideProfile : t().showProfile);
          profileToggle.title = t().profile;
          profileDrawerClose.setAttribute("aria-label", t().hideProfile);
          accountBackdrop.setAttribute("aria-label", t().hideProfile);
          document.getElementById("profile-name-label").textContent = t().profileName;
          document.getElementById("profile-avatar-label").textContent = t().profileAvatar;
          document.getElementById("profile-save").textContent = t().profileSave;
          document.getElementById("profile-heading").textContent = t().profile;
          document.getElementById("close-profile").textContent = t().closeProfile;
          accountLogout.textContent = t().signOut;
          accountGuests.disabled = !state.user;
          accountNotebookButton.disabled = !state.user;
          accountVocabularyButton.disabled = !state.user;
          accountStartGame.disabled = !state.user;
          accountStartGame.textContent = t().playButton;
          document.getElementById("account-guests").textContent = t().guestsButton;
          accountNotebookButton.textContent = t().notebookButton;
          document.getElementById("notebook-heading").textContent = t().notebook;
          accountVocabularyButton.textContent = t().vocabularyButton;
          document.getElementById("minimize-game").setAttribute("aria-label", t().minimize);
          document.getElementById("minimize-game").title = t().minimize;
          homeMenuButton.setAttribute("aria-label", t().mainMenu);
          homeMenuButton.title = t().mainMenu;
          homeMenuButton.hidden = !state.user || state.authMode === "menu";
          restoreGame.textContent = t().restore;
          updateMusicControls();
          renderJournal();
          updateStatus();
          if (state.authMode === "menu" || (state.user && !state.started)) showMainMenu();
          else if (!state.user) showAuth(state.authMode);
          else if (state.started) renderView();
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
          homeMenuButton.hidden = true;
          profileToggle.hidden = true;
          setMusicTrack("menu");
          accountLogout.hidden = true;
          document.getElementById("account-name").textContent = t().accountName;
          document.getElementById("account-role").textContent = t().accountRole;
          updateStatus();
          setScreen(t().account, mode === "register" ? t().signUp : t().signIn, t().authIntro);
          screen.classList.add("auth-screen");

          const form = document.createElement("form");
          form.className = "auth-form";
          const emailInput = addField(
            form,
            "email",
            mode === "register" ? t().email : t().loginIdentifier,
            mode === "register" ? "email" : "text",
            true
          );
          emailInput.autocomplete = mode === "register" ? "email" : "username";
          emailInput.maxLength = 254;

          let usernameInput = null;
          if (mode === "register") {
            usernameInput = addField(form, "username", t().username, "text", true);
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
          passwordInput.minLength = mode === "register" ? 10 : 1;
          passwordInput.maxLength = 128;

          let checkPassword = () => true;
          if (mode === "register") {
            const passwordRequirements = document.createElement("ul");
            passwordRequirements.className = "password-requirements";
            passwordRequirements.setAttribute("aria-live", "polite");
            const requirementLabels = {
              length: t().passwordRuleLength,
              lowercase: t().passwordRuleLowercase,
              uppercase: t().passwordRuleUppercase,
              number: t().passwordRuleNumber,
              symbol: t().passwordRuleSymbol,
            };
            const requirementItems = {};
            for (const [key, label] of Object.entries(requirementLabels)) {
              requirementItems[key] = text(passwordRequirements, "li", label);
            }
            form.append(passwordRequirements);
            const personalWarning = text(form, "p", t().passwordPersonalWarning, "field-feedback error");
            personalWarning.hidden = true;

            const normalizePersonalTerm = (value) => value
              .normalize("NFKD")
              .replace(/\p{M}/gu, "")
              .toLowerCase()
              .replace(/[^\p{L}\p{N}]/gu, "");
            checkPassword = () => {
              const value = passwordInput.value;
              const criteria = {
                length: [...value].length >= 10 && [...value].length <= 128,
                maxBytes: new TextEncoder().encode(value).length <= 72,
                lowercase: /\p{Ll}/u.test(value),
                uppercase: /\p{Lu}/u.test(value),
                number: /\p{Nd}/u.test(value),
                symbol: /[\p{P}\p{S}]/u.test(value),
              };
              for (const [key, item] of Object.entries(requirementItems)) {
                item.classList.toggle("valid", criteria[key]);
              }
              const personalTerms = [
                usernameInput.value,
                emailInput.value.split("@", 1)[0],
              ]
                .map(normalizePersonalTerm)
                .filter((term) => term.length > 2);
              const normalizedPassword = normalizePersonalTerm(value);
              personalWarning.hidden = !personalTerms.some((term) =>
                normalizedPassword.includes(term)
              );
              return Object.values(criteria).every(Boolean);
            };
            passwordInput.addEventListener("input", checkPassword);
            usernameInput.addEventListener("input", checkPassword);
            emailInput.addEventListener("input", checkPassword);
          }

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
          const backButton = text(form, "button", t().backToMenu, "action-button");
          backButton.type = "button";
          backButton.addEventListener("click", () => showMainMenu());
          form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!checkPassword()) {
              errorBox.textContent = t().weakPassword;
              return;
            }
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
                errorBox.textContent = authErrorMessage(
                  result.detail,
                  response.headers.get("Retry-After")
                );
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

        function authErrorMessage(detail, retryAfter = "") {
          const code = detail && typeof detail === "object" ? detail.code : "";
          if (code === "email_taken") return t().emailTaken;
          if (code === "username_taken") return t().usernameTaken;
          if (code === "password") return t().weakPassword;
          if (code === "invalid_credentials") return t().authFailed;
          if (code === "login_rate_limited") {
            const seconds = Number.parseInt(retryAfter, 10);
            return Number.isFinite(seconds) && seconds > 0
              ? `${t().loginRateLimited} (${seconds} sec.)`
              : t().loginRateLimited;
          }
          return detail && detail.message ? detail.message : t().authFailed;
        }

        function updateAccount(user) {
          state.user = user;
          const avatarData = user.avatar_data && user.avatar_mime_type
            ? `data:${user.avatar_mime_type};base64,${user.avatar_data}`
            : "";
          document.getElementById("account-name").textContent = user.display_name || user.username;
          showAvatar(accountAvatar, avatarData);
          profileNameInput.value = user.display_name || user.username;
          showAvatar(profileAvatarPreview, avatarData);
          profileAvatarPreview.dataset.imageData = avatarData;
          const accountEmail = document.getElementById("account-role");
          accountEmail.textContent = user.email;
          accountEmail.title = user.email;
          accountLogout.hidden = false;
          updateStatus();
        }

        function showAvatar(container, imageData) {
          container.replaceChildren();
          if (!imageData) {
            container.textContent = "🕵️";
            return;
          }
          const image = document.createElement("img");
          image.src = imageData;
          image.alt = "";
          container.append(image);
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
          state.authMode = "menu";
          showMainMenu();
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
          screen.classList.remove("auth-screen", "menu-screen", "story-screen");
          text(screen, "div", kicker, "scene-kicker");
          text(screen, "h2", heading, "scene-title");
          if (description) text(screen, "p", description, "scene-copy");
        }

        function showMainMenu(errorMessage = "") {
          state.authMode = "menu";
          setMusicTrack("menu");
          homeMenuButton.hidden = !state.user;
          profileToggle.hidden = !state.user;
          accountLogout.hidden = !state.user;
          if (!state.user) {
            document.getElementById("account-name").textContent = t().accountName;
            document.getElementById("account-role").textContent = t().accountRole;
          }
          setScreen(t().caseNumber, t().title, t().menuIntro);
          screen.classList.add("menu-screen");

          const panel = document.createElement("section");
          panel.className = "main-menu-panel";
          text(panel, "h3", state.user ? t().menuWelcome : t().menuGuest);
          if (errorMessage) text(panel, "p", errorMessage, "menu-error");

          const actions = document.createElement("div");
          actions.className = "main-menu-actions";
          function addMenuAction(label, action, primary = false) {
            const item = text(
              actions,
              "button",
              label,
              `main-menu-button${primary ? " primary" : ""}`
            );
            item.type = "button";
            item.dataset.action = action;
          }

          if (state.user) {
            const canContinue = state.started
              && state.game
              && !state.game.progress.completed;
            addMenuAction(
              canContinue ? t().menuContinue : t().menuStart,
              "menu-start",
              true
            );
            addMenuAction(t().menuProfile, "menu-profile");
            addMenuAction(t().menuLogout, "menu-logout");
          } else {
            addMenuAction(t().menuStart, "menu-start", true);
            addMenuAction(t().menuSignIn, "menu-sign-in");
            addMenuAction(t().menuRegister, "menu-register");
          }
          panel.append(actions);

          const preferences = document.createElement("div");
          preferences.className = "main-menu-settings";
          const languageControls = document.createElement("div");
          languageControls.className = "main-menu-languages";
          ["ru", "en"].forEach((language) => {
            const languageButton = text(
              languageControls,
              "button",
              language.toUpperCase(),
              "main-menu-language"
            );
            languageButton.type = "button";
            languageButton.dataset.action = "choose-language";
            languageButton.dataset.value = language;
            languageButton.setAttribute(
              "aria-pressed",
              String(state.language === language)
            );
            languageButton.setAttribute(
              "aria-label",
              language === "ru" ? "Русский" : "English"
            );
          });
          preferences.append(languageControls);

          const volumeLabel = document.createElement("label");
          volumeLabel.className = "main-menu-volume";
          text(volumeLabel, "span", t().musicVolume);
          const volumeRow = document.createElement("span");
          volumeRow.className = "volume-control-row";
          const volumeInput = document.createElement("input");
          volumeInput.id = "main-menu-volume";
          volumeInput.type = "range";
          volumeInput.min = "0";
          volumeInput.max = "100";
          volumeInput.value = String(Math.round(backgroundMusic.volume * 100));
          volumeInput.dataset.musicVolume = "";
          volumeInput.setAttribute("aria-label", t().musicVolume);
          volumeRow.append(volumeInput);
          const volumeOutput = text(volumeRow, "output", `${volumeInput.value}%`);
          volumeOutput.htmlFor = volumeInput.id;
          volumeLabel.append(volumeRow);
          preferences.append(volumeLabel);
          const menuMusicStatus = text(preferences, "p", "", "music-status");
          menuMusicStatus.setAttribute("role", "status");
          panel.append(preferences);

          const spider = document.createElement("span");
          spider.className = "menu-spider";
          spider.setAttribute("aria-hidden", "true");
          panel.append(spider);
          screen.append(panel);
          updateMusicControls();
        }

        function addNovelDialogue(speaker, portrait = "🕵️", entries = null, scene = "study", choices = []) {
          let stage = screen.querySelector(".novel-stage");
          if (!stage) {
            stage = document.createElement("div");
            stage.className = "novel-stage";
            stage.setAttribute("aria-label", t().blackScene);
            screen.append(stage);
          }
          stage.dataset.scene = scene;
          const panel = document.createElement("section");
          panel.className = "novel-dialogue";
          panel.setAttribute("aria-label", `${speaker} — ${t().dialogueLabel}`);
          const image = text(panel, "div", portrait, "novel-portrait");
          image.setAttribute("aria-hidden", "true");
          const copyPanel = document.createElement("div");
          copyPanel.className = "novel-dialogue-copy";
          const speakerNode = text(copyPanel, "h3", speaker, "novel-speaker");
          const lineNode = text(copyPanel, "p", t().placeholderDialogue, "novel-line");
          lineNode.setAttribute("aria-live", "polite");
          const sequence = entries && entries.length ? entries : [{ speaker, portrait, line: t().placeholderDialogue }];
          const nextButton = text(copyPanel, "button", t().dialogueContinue, "action-button");
          nextButton.type = "button";
          const choicesPanel = document.createElement("div");
          choicesPanel.className = "dialogue-choices";
          choicesPanel.hidden = true;
          nextButton.addEventListener("click", () => {
            sequenceIndex = Math.min(sequenceIndex + 1, sequence.length - 1);
            renderEntry();
          });
          let sequenceIndex = 0;
          function renderChoices() {
            if (!choices.length) return;
            panel.replaceChildren();
            panel.classList.add("has-choices");
            text(panel, "div", t().chooseAction, "novel-speaker");
            choicesPanel.replaceChildren();
            choicesPanel.hidden = false;
            choices.forEach((choice) => {
              const choiceButton = button(choicesPanel, choice.label, choice.action, choice.value);
              choiceButton.className = "dialogue-choice";
            });
            panel.append(choicesPanel);
          }
          function renderEntry() {
            const entry = sequence[sequenceIndex];
            speakerNode.textContent = entry.speaker;
            lineNode.textContent = entry.line;
            image.textContent = entry.portrait || portrait;
            nextButton.hidden = sequenceIndex === sequence.length - 1;
            if (sequenceIndex === sequence.length - 1 && choices.length) {
              renderChoices();
            }
          }
          renderEntry();
          panel.append(copyPanel);
          stage.append(panel);
        }

        function updateStatus() {
          status.textContent = state.started
            ? t().progress(state.clues.size, areas.length)
            : t().noCase;
          accountGuests.disabled = !state.user;
          accountNotebookButton.disabled = !state.user;
          accountVocabularyButton.disabled = !state.user;
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

        function renderVocabularyGame(game) {
          let questionIndex = 0;
          let score = 0;

          function shuffledOptions(question) {
            const answer = question.answer;
            const incorrect = question.options.filter((option) => option !== answer);

            for (let index = incorrect.length - 1; index > 0; index -= 1) {
              const swapIndex = Math.floor(Math.random() * (index + 1));
              [incorrect[index], incorrect[swapIndex]] = [incorrect[swapIndex], incorrect[index]];
            }

            // Move the correct answer through the grid: B, C, D, A, ...
            // This prevents every question from having the answer in the first cell.
            const correctIndex = (questionIndex + 1) % question.options.length;
            incorrect.splice(correctIndex, 0, answer);
            return incorrect;
          }

          function renderQuestion() {
            const question = game.questions[questionIndex];
            setScreen(
              game.title,
              `Question ${questionIndex + 1} / ${game.questions.length}`,
              `Score: ${score} · ${game.description}`
            );
            const quizHero = document.createElement("div");
            quizHero.className = "vocab-quiz-hero";
            text(quizHero, "span", game.id === "crime-quiz" ? "🕵️" : game.id === "word-detective" ? "🔎" : "🧩", "vocab-quiz-icon");
            const progress = document.createElement("div");
            progress.className = "vocab-progress";
            const progressBar = document.createElement("span");
            progressBar.style.width = `${((questionIndex + 1) / game.questions.length) * 100}%`;
            progress.append(progressBar);
            quizHero.append(progress);
            text(quizHero, "strong", `${questionIndex + 1} / ${game.questions.length}`, "vocab-progress-label");
            screen.append(quizHero);

            const questionCard = document.createElement("section");
            questionCard.className = "vocab-question-card";
            text(questionCard, "span", "CASE FILE · QUESTION", "vocab-card-kicker");
            text(questionCard, "p", question.prompt, "vocab-question-text");
            screen.append(questionCard);

            const choices = document.createElement("div");
            choices.className = "vocab-answer-grid";
            shuffledOptions(question).forEach((option, optionIndex) => {
              const choice = button(choices, option, "vocabulary-choice");
              choice.className = "vocab-answer-card";
              choice.dataset.option = String.fromCharCode(65 + optionIndex);
              choice.addEventListener("click", () => {
                choices.querySelectorAll("button").forEach((item) => {
                  item.disabled = true;
                });
                const correct = option === question.answer;
                if (correct) score += 1;
                choice.classList.add(correct ? "correct" : "wrong");
                text(
                  screen,
                  "p",
                  correct ? "Correct! +1 point" : `Not quite. The answer is: ${question.answer}`,
                  correct ? "game-result" : "game-result wrong"
                );
                const next = button(
                  screen,
                  questionIndex + 1 < game.questions.length ? "Next question" : "See result",
                  "vocabulary-next"
                );
                next.className = "start-button";
                next.addEventListener("click", () => {
                  questionIndex += 1;
                  if (questionIndex < game.questions.length) renderQuestion();
                  else renderVocabularyResult(game, score);
                });
              });
            });
            screen.append(choices);
            const back = button(screen, "Back to vocabulary", "vocabulary-home");
            back.className = "quiet-button";
          }

          renderQuestion();
        }

        function renderVocabularyResult(game, score) {
          const total = game.questions.length;
          const percentage = Math.round((score / total) * 100);
          setScreen(game.title, "Game complete!", `Your score: ${score} / ${total} (${percentage}%).`);
          const resultPanel = document.createElement("div");
          resultPanel.className = "vocab-result-panel";
          text(resultPanel, "div", `${percentage}%`, "vocab-score-badge");
          text(resultPanel, "p", `${score} / ${total} correct answers`, "vocab-card-meta");
          screen.append(resultPanel);
          text(
            screen,
            "p",
            percentage === 100
              ? "Perfect detective work!"
              : percentage >= 60
                ? "Good investigation. Try once more to improve your score."
                : "Review the vocabulary and try again.",
            "game-result"
          );
          const again = button(screen, "Play again", "vocabulary-replay");
          again.className = "start-button";
          again.addEventListener("click", () => renderVocabularyGame(game));
          const back = button(screen, "Back to vocabulary", "vocabulary-home");
          back.className = "quiet-button";
        }

        function renderMatchingExercise(card, exercise) {
          const questionSource = exercise.items.join(" ");
          const optionSource = exercise.options.join(" ");
          const questions = [...questionSource.matchAll(/(\d+)\.\s*([^\d]+?)(?=\s+\d+\.|$)/g)]
            .map((match) => ({ number: match[1], text: match[2].trim() }));
          const options = [...optionSource.matchAll(/([a-j])\)\s*(.*?)(?=\s+[a-j]\)|$)/gi)]
            .map((match) => ({ letter: match[1].toLowerCase(), text: match[2].trim() }));
          const answerMap = Object.fromEntries(
            exercise.answer.split(",").map((pair) => {
              const match = pair.trim().match(/(\d+)-([a-j])/i);
              return [match[1], match[2].toLowerCase()];
            })
          );
          const assigned = new Map();
          let selectedLetter = "";

          text(card, "p", "Перетащите букву с определением к соответствующему номеру.", "matching-instruction");
          const board = document.createElement("div");
          board.className = "matching-board";
          const bank = document.createElement("div");
          bank.className = "matching-bank";
          text(bank, "h4", "Ответы", "matching-heading");
          const slots = document.createElement("div");
          slots.className = "matching-slots";
          text(slots, "h4", "Вопросы", "matching-heading");
          const feedback = text(card, "p", "Выберите карточку или перетащите её мышкой.", "matching-feedback");

          function assign(letter, number) {
            for (const [assignedNumber, assignedLetter] of assigned) {
              if (assignedLetter === letter || assignedNumber === number) assigned.delete(assignedNumber);
            }
            assigned.set(number, letter);
            selectedLetter = "";
            renderBoard();
          }

          function renderBoard() {
            bank.replaceChildren();
            slots.replaceChildren();
            text(bank, "h4", "Ответы", "matching-heading");
            text(slots, "h4", "Вопросы", "matching-heading");

            options.forEach((option) => {
              const tile = text(bank, "button", `${option.letter}) ${option.text}`, "matching-answer");
              tile.type = "button";
              tile.draggable = true;
              tile.classList.toggle("is-selected", selectedLetter === option.letter);
              tile.classList.toggle("is-used", [...assigned.values()].includes(option.letter));
              tile.addEventListener("click", () => {
                selectedLetter = selectedLetter === option.letter ? "" : option.letter;
                feedback.textContent = selectedLetter
                  ? `Буква «${selectedLetter}» выбрана. Нажмите на номер вопроса.`
                  : "Выберите карточку или перетащите её мышкой.";
                renderBoard();
              });
              tile.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", option.letter);
                event.dataTransfer.effectAllowed = "move";
              });
            });

            questions.forEach((question) => {
              const row = document.createElement("div");
              row.className = "matching-question";
              text(row, "strong", `${question.number}.`, "matching-number");
              text(row, "span", question.text, "matching-question-text");
              const dropZone = text(row, "button", "Перетащите букву сюда", "matching-dropzone");
              dropZone.type = "button";
              const assignedLetter = assigned.get(question.number);
              if (assignedLetter) {
                dropZone.textContent = `${assignedLetter}) Ответ выбран`;
                dropZone.classList.add("has-answer");
              }
              dropZone.addEventListener("click", () => {
                if (selectedLetter) assign(selectedLetter, question.number);
              });
              dropZone.addEventListener("dragover", (event) => {
                event.preventDefault();
                dropZone.classList.add("is-over");
              });
              dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-over"));
              dropZone.addEventListener("drop", (event) => {
                event.preventDefault();
                dropZone.classList.remove("is-over");
                assign(event.dataTransfer.getData("text/plain"), question.number);
              });
              slots.append(row);
            });
          }

          renderBoard();
          board.append(bank, slots);
          card.append(board);

          const check = button(card, "Проверить сопоставление", "matching-check");
          check.className = "start-button";
          check.addEventListener("click", () => {
            const correct = questions.filter((question) => assigned.get(question.number) === answerMap[question.number]).length;
            slots.querySelectorAll(".matching-question").forEach((row) => {
              const number = row.querySelector(".matching-number").textContent.replace(".", "");
              row.classList.toggle("is-correct", assigned.get(number) === answerMap[number]);
              row.classList.toggle("is-wrong", assigned.has(number) && assigned.get(number) !== answerMap[number]);
            });
            feedback.className = `matching-feedback ${correct === questions.length ? "is-correct" : "is-wrong"}`;
            feedback.textContent = `${correct} / ${questions.length} правильных ответов`;
          });
        }

        function renderDragPairsExercise(card, exercise) {
          const pairs = exercise.drag_pairs;
          const options = [...exercise.drag_options].sort(() => Math.random() - 0.5);
          const answerMap = Object.fromEntries(pairs.map((pair) => [pair.id, pair.answer]));
          const allowReuse = new Set(pairs.map((pair) => pair.answer)).size < pairs.length;
          const assigned = new Map();
          let selectedAnswer = "";
          text(card, "p", "Перетащите вариант ответа к подходящему вопросу.", "matching-instruction");

          const board = document.createElement("div");
          board.className = "matching-board generic-drag-board";
          const bank = document.createElement("div");
          bank.className = "matching-bank";
          const slots = document.createElement("div");
          slots.className = "matching-slots";
          const feedback = text(card, "p", "Можно также выбрать карточку и нажать на вопрос.", "matching-feedback");

          function assign(answer, id) {
            for (const [assignedId, assignedAnswer] of assigned) {
              if (assignedId === id || (!allowReuse && assignedAnswer === answer)) assigned.delete(assignedId);
            }
            assigned.set(id, answer);
            selectedAnswer = "";
            renderBoard();
          }

          function renderBoard() {
            bank.replaceChildren();
            slots.replaceChildren();
            text(bank, "h4", "Варианты ответа", "matching-heading");
            text(slots, "h4", "Вопросы", "matching-heading");
            options.forEach((answer) => {
              const tile = text(bank, "button", answer, "matching-answer");
              tile.type = "button";
              tile.draggable = true;
              tile.classList.toggle("is-selected", selectedAnswer === answer);
              tile.classList.toggle("is-used", !allowReuse && [...assigned.values()].includes(answer));
              tile.addEventListener("click", () => {
                selectedAnswer = selectedAnswer === answer ? "" : answer;
                renderBoard();
              });
              tile.addEventListener("dragstart", (event) => {
                event.dataTransfer.setData("text/plain", answer);
                event.dataTransfer.effectAllowed = "move";
              });
            });
            pairs.forEach((pair) => {
              const row = document.createElement("div");
              row.className = "matching-question";
              text(row, "strong", `${pair.id}.`, "matching-number");
              text(row, "span", pair.prompt, "matching-question-text");
              const drop = text(row, "button", "Перетащите ответ сюда", "matching-dropzone");
              drop.type = "button";
              if (assigned.has(pair.id)) {
                drop.textContent = assigned.get(pair.id);
                drop.classList.add("has-answer");
              }
              drop.addEventListener("click", () => {
                if (selectedAnswer) assign(selectedAnswer, pair.id);
              });
              drop.addEventListener("dragover", (event) => {
                event.preventDefault();
                drop.classList.add("is-over");
              });
              drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
              drop.addEventListener("drop", (event) => {
                event.preventDefault();
                drop.classList.remove("is-over");
                assign(event.dataTransfer.getData("text/plain"), pair.id);
              });
              slots.append(row);
            });
          }

          renderBoard();
          board.append(bank, slots);
          card.append(board);
          const check = button(card, "Проверить ответы", "drag-pairs-check");
          check.className = "start-button";
          check.addEventListener("click", () => {
            const correct = pairs.filter((pair) => assigned.get(pair.id) === answerMap[pair.id]).length;
            slots.querySelectorAll(".matching-question").forEach((row, index) => {
              const pair = pairs[index];
              row.classList.toggle("is-correct", assigned.get(pair.id) === pair.answer);
              row.classList.toggle("is-wrong", assigned.has(pair.id) && assigned.get(pair.id) !== pair.answer);
            });
            feedback.className = `matching-feedback ${correct === pairs.length ? "is-correct" : "is-wrong"}`;
            feedback.textContent = `${correct} / ${pairs.length} правильных ответов`;
          });
        }

        function renderVocabularyHome(result) {
          setScreen(t().vocabularyKicker, t().vocabularyTitle, t().vocabularyIntro);

          text(screen, "h3", "Mini-games", "section-title");
          const games = document.createElement("div");
          games.className = "vocab-game-grid";
          const gameIcons = {
            "crime-quiz": "🕵️",
            "word-detective": "🔎",
            "mini-mystery": "🧩",
          };
          result.games.forEach((game, gameIndex) => {
            const card = document.createElement("article");
            card.className = `vocab-game-card vocab-game-card-${gameIndex + 1}`;
            text(card, "div", gameIcons[game.id] || "📚", "vocab-card-icon");
            const cardBody = document.createElement("div");
            text(cardBody, "span", `CASE ${String(gameIndex + 1).padStart(2, "0")}`, "vocab-card-kicker");
            text(cardBody, "h3", game.title);
            text(cardBody, "p", game.description, "vocab-card-description");
            text(cardBody, "p", `${game.questions.length} questions · 1 point for each correct answer`, "vocab-card-meta");
            card.append(cardBody);
            const start = button(card, "Start game", "vocabulary-start");
            start.className = "start-button";
            start.addEventListener("click", () => renderVocabularyGame(game));
            games.append(card);
          });
          screen.append(games);

          const practiceHeading = text(screen, "h3", "Practice exercises", "section-title");
          practiceHeading.tabIndex = -1;
          practiceHeading.id = "practice-exercises-heading";
          const list = document.createElement("div");
          list.className = "vocab-exercise-grid";
          list.id = "practice-exercises-list";
          result.exercises.forEach((exercise, exerciseIndex) => {
            const card = document.createElement("article");
            card.className = "vocab-exercise-card";
            text(card, "span", String(exerciseIndex + 1).padStart(2, "0"), "vocab-exercise-number");
            text(card, "h3", exercise.title);
            if (exercise.id === 1) {
              renderMatchingExercise(card, exercise);
              list.append(card);
              return;
            }
            if (exercise.drag_pairs) {
              renderDragPairsExercise(card, exercise);
              list.append(card);
              return;
            }
            text(card, "p", exercise.instruction, "vocab-card-description");
            (exercise.items || []).forEach((item) => text(card, "p", item));
            (exercise.options || []).forEach((option) => text(card, "p", option));

            const answerDetails = document.createElement("details");
            const answerSummary = text(answerDetails, "summary", t().showAnswer);
            answerSummary.className = "action-button";
            text(answerDetails, "p", exercise.answer);
            card.append(answerDetails);
            list.append(card);
          });
          screen.append(list);
          const back = button(screen, t().backToGame, "vocabulary-back");
          back.className = "start-button";
        }

        async function showVocabulary() {
          try {
            const response = await apiFetch("/api/game/vocabulary");
            if (response.status === 401) {
              state.csrfToken = "";
              showAuth("login", t().csrfError);
              return;
            }
            if (!response.ok) throw new Error(`Could not load vocabulary: ${response.status}`);
            const result = await response.json();
            renderVocabularyHome(result);
          } catch (error) {
            setScreen(t().connectionError, t().vocabularyError, t().vocabularyError);
            console.error(error);
          }
        }

        function renderStudyMap() {
          const map = document.createElement("section");
          map.className = "study-map";
          map.setAttribute("aria-label", t().roomMapLabel);
          text(map, "div", t().lockedRoom, "study-map-caption");

          (state.game.scene_objects || []).forEach((object) => {
            const area = t().areas[object.clue_index];
            const hotspot = document.createElement("button");
            hotspot.type = "button";
            hotspot.className = "study-hotspot";
            hotspot.dataset.action = "inspect";
            hotspot.dataset.value = object.clue_index;
            hotspot.style.left = `${object.left}%`;
            hotspot.style.top = `${object.top}%`;
            hotspot.disabled = state.clues.has(object.clue_index);
            hotspot.classList.toggle("is-found", hotspot.disabled);
            hotspot.setAttribute(
              "aria-label",
              `${area.title} — ${hotspot.disabled ? t().found : t().examine}`
            );
            text(hotspot, "span", object.icon, "study-hotspot-icon");
            text(hotspot, "span", area.title, "study-hotspot-label");
            map.append(hotspot);
          });

          screen.append(map);
        }

        function showScene() {
          setScreen(t().room, t().inspectRoom, "");
          renderStudyMap();
          const sceneChoices = t().areas
            .map((area, index) => ({
              label: `${t().examine}: ${area.title}`,
              action: "inspect",
              value: index,
            }))
            .filter((choice) => !state.clues.has(choice.value));
          addNovelDialogue(t().detective, "🕵️", t().studyDialogues, "study", sceneChoices);
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
          screen.classList.add("story-screen");
          addNovelDialogue(t().detective, "🕵️", t().openingDialogues, "opening", [
            { label: t().start, action: "start" },
          ]);
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
            addNovelDialogue(t().detective, "🕵️", t().clueDialogues[index], "evidence");
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
          addNovelDialogue(details.name, portraits[suspect.id] || "👤", t().interviewDialogues[suspect.id], "interview");
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
            if (verdict.correct) addNovelDialogue(t().detective, "🕵️", t().revealDialogues, "reveal");
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
          if (action === "menu-sign-in") {
            showAuth("login");
          } else if (action === "menu-register") {
            showAuth("register");
          } else if (action === "menu-start") {
            if (!state.user) {
              showAuth("login", t().startRequiresSignIn);
            } else if (state.game.progress.completed) {
              setScreen(t().caseNumber, t().gameCompleted, t().gameCompleted);
              const restart = button(screen, t().restart, "restart");
              restart.className = "start-button";
            } else if (state.started) {
              state.authMode = "game";
              setMusicTrack("game");
              renderView();
            } else {
              state.authMode = "game";
              setMusicTrack("game");
              showLanding();
            }
          } else if (action === "menu-profile") {
            profileOpen.click();
          } else if (action === "menu-logout") {
            accountLogout.click();
          } else if (action === "choose-language") {
            setLanguage(value);
          } else if (action === "main-menu") {
            showMainMenu();
          } else if (action === "start") {
            state.started = true;
            state.authMode = "game";
            setMusicTrack("game");
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
              setMusicTrack("game");
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
          } else if (action === "vocabulary-back") {
            state.view = "scene";
            updateStatus();
            renderView();
          } else if (action === "vocabulary-home") {
            showVocabulary();
          }
        });

        accountGuests.addEventListener("click", () => {
          if (!state.game) return;
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          state.started = true;
          state.view = "suspects";
          setMusicTrack("game");
          updateStatus();
          renderView();
        });

        accountNotebookButton.addEventListener("click", () => {
          if (!state.game) return;
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          state.started = true;
          state.view = "journal";
          setMusicTrack("game");
          updateStatus();
          renderView();
        });

        accountVocabularyButton.addEventListener("click", () => {
          gameWindow.classList.remove("minimized");
          restoreGame.hidden = true;
          showVocabulary();
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
          setMusicTrack("game");
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
            showMainMenu();
          } catch (error) {
            setScreen(t().connectionError, t().logoutError, t().logoutError);
            console.error(error);
          } finally {
            accountLogout.disabled = false;
          }
        });

        profileOpen.addEventListener("click", () => {
          const user = state.user;
          profileNameInput.value = user?.display_name || user?.username || t().accountName;
          profileFileInput.value = "";
          profileFeedback.textContent = "";
          const avatarData = user?.avatar_data && user?.avatar_mime_type
            ? `data:${user.avatar_mime_type};base64,${user.avatar_data}`
            : "";
          showAvatar(profileAvatarPreview, avatarData);
          profileAvatarPreview.dataset.imageData = avatarData;
          profileDialog.showModal();
          profileNameInput.focus();
        });

        profileFileInput.addEventListener("change", () => {
          const file = profileFileInput.files[0];
          if (!file) return;
          if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)
            || file.size > 2 * 1024 * 1024
          ) {
            profileFeedback.textContent = t().profileImageError;
            profileFileInput.value = "";
            return;
          }
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            showAvatar(profileAvatarPreview, reader.result);
            profileAvatarPreview.dataset.imageData = reader.result;
            profileFeedback.textContent = "";
          });
          reader.readAsDataURL(file);
        });

        profileForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          if (!state.user) return;
          const displayName = profileNameInput.value.trim().slice(0, 32);
          if (!displayName) {
            profileNameInput.focus();
            return;
          }
          try {
            const response = await apiFetch("/api/auth/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                display_name: displayName,
                date_of_birth: state.user.date_of_birth,
                phone: state.user.phone,
                avatar_data: profileAvatarPreview.dataset.imageData || null,
              }),
            });
            const result = await response.json();
            if (!response.ok) {
              const detail = result.detail;
              profileFeedback.textContent = detail && typeof detail === "object" && detail.message
                ? detail.message
                : t().profileSaveError;
              return;
            }
            updateAccount(result);
            profileDialog.close();
          } catch (error) {
            profileFeedback.textContent = t().profileSaveError;
            console.error(error);
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

        function setProfileDrawerOpen(isOpen) {
          accountPanel.classList.toggle("is-open", isOpen);
          accountBackdrop.classList.toggle("is-open", isOpen);
          accountPanel.setAttribute("aria-hidden", String(!isOpen));
          accountPanel.inert = !isOpen;
          profileToggle.setAttribute("aria-expanded", String(isOpen));
          profileToggle.setAttribute("aria-label", isOpen ? t().hideProfile : t().showProfile);
          if (isOpen) profileDrawerClose.focus({ preventScroll: true });
          else profileToggle.focus({ preventScroll: true });
        }

        profileToggle.addEventListener("click", () => {
          setProfileDrawerOpen(!accountPanel.classList.contains("is-open"));
        });
        profileDrawerClose.addEventListener("click", () => setProfileDrawerOpen(false));
        accountBackdrop.addEventListener("click", () => setProfileDrawerOpen(false));
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && accountPanel.classList.contains("is-open")) {
            setProfileDrawerOpen(false);
          }
        });

        openSettings.addEventListener("click", () => {
          settingsDialog.showModal();
        });
        closeSettings.addEventListener("click", () => settingsDialog.close());
        document.getElementById("close-profile").addEventListener("click", () => profileDialog.close());
        settingsDialog.addEventListener("click", (event) => {
          if (event.target === settingsDialog) settingsDialog.close();
        });
        profileDialog.addEventListener("click", (event) => {
          if (event.target === profileDialog) profileDialog.close();
        });

        async function initialize() {
          try {
            const response = await fetch("/api/auth/me");
            if (!response.ok) throw new Error(`Could not check sign-in: ${response.status}`);
            const account = await response.json();
            if (!account.authenticated) {
              showMainMenu();
              return;
            }
            state.csrfToken = account.csrf_token;
            state.user = account.user;
            await openUserGame();
          } catch (error) {
            state.csrfToken = "";
            state.user = null;
            state.game = null;
            state.started = false;
            showMainMenu(t().authFailed);
            console.error(error);
          }
        }

        homeMenuButton.addEventListener("click", () => showMainMenu());
        setLanguage(state.language);
        initialize();
      })();
