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
        const profileOpen = document.getElementById("profile-open");
        const profileForm = document.getElementById("profile-settings");
        const profileDialog = document.getElementById("profile-dialog");
        const profileNameInput = document.getElementById("profile-display-name");
        const profileFileInput = document.getElementById("profile-avatar-file");
        const profileAvatarPreview = document.getElementById("profile-avatar-preview");
        const profileFeedback = document.getElementById("profile-feedback");
        const accountAvatar = document.getElementById("account-avatar");
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
            profileName: "Никнейм",
            profileAvatar: "Фото профиля (изображение до 2 МБ)",
            profileSave: "Сохранить профиль",
            closeProfile: "Закрыть",
            profileImageError: "Выберите изображение размером не более 2 МБ.",
            profileSaveError: "Не удалось сохранить профиль в этом браузере.",
            language: "Язык",
            logo: "🕰 Последний звонок",
            account: "Аккаунт",
            accountName: "Детектив",
            accountRole: "Игрок",
            guestsButton: "Гости отеля",
            playButton: "Играть",
            detective: "Детектив",
            dialogueLabel: "Реплика персонажа",
            dialogueContinue: "Далее",
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
            openingDialogues: [
              { speaker: "Рассказчик", portrait: "🌨️", line: "Снежная буря отрезала старый загородный отель от города. Вечером Виктор Арден собрал пятерых гостей на ужин." },
              { speaker: "Виктор Арден", portrait: "🧔🏻", line: "Завтра утром я собираюсь кое-что изменить. И кое-кому из вас это очень не понравится." },
              { speaker: "Рассказчик", portrait: "🌨️", line: "В 23:17 часы пробили одиннадцать раз. После паузы раздался ещё один удар. Вскоре Ардена нашли мёртвым в запертом кабинете." },
              { speaker: "Детектив", portrait: "🕵️", line: "Окно открыто, следы ведут к лесу, а карманные часы остановились на 23:17. Слишком много совпадений." },
            ],
            studyDialogues: [
              { speaker: "Рассказчик", portrait: "🕯️", line: "На столе стоят бокал вина и раскрытый сейф. Рядом лежат семейная фотография и лист с именем «Элиза»." },
              { speaker: "Детектив", portrait: "🕵️", line: "Вино не отравлено. Причина смерти — удар по голове, но оружия в кабинете нет." },
              { speaker: "Детектив", portrait: "🕵️", line: "Начну с часов, окна, камина и документов. Каждая деталь может изменить ход расследования." },
            ],
            clueDialogues: [
              [{ speaker: "Детектив", portrait: "🕵️", line: "Эти часы не работали десять лет. Кто-то заставил механизм сделать лишний удар вручную." }],
              [{ speaker: "Детектив", portrait: "🕵️", line: "Следы ведут от окна к лесу, но к окну никто не подходил. Побег наружу инсценировали." }],
              [{ speaker: "Детектив", portrait: "🕵️", line: "На камине осталось крошечное пятно крови. Кто-то ударил Ардена, но этого удара оказалось недостаточно, чтобы убить его." }],
              [{ speaker: "Детектив", portrait: "🕵️", line: "На обороте фотографии написано: «Настоящее имя — Элиза Ланге». Элиза — дочь Софии." }],
              [{ speaker: "Детектив", portrait: "🕵️", line: "Карманные часы остановили позже настоящей смерти. 23:17 — поддельное время." }],
            ],
            interviewDialogues: {
              eliza: [{ speaker: "Элиза", portrait: "👩🏻", line: "Я ненавидела его. Но не убивала. Почти весь вечер я была в библиотеке." }],
              mark: [{ speaker: "Марк", portrait: "🧔🏻", line: "В 23:10 я был в винном погребе. Камеры выключились? Этого я объяснить не могу." }],
              sofia: [{ speaker: "София", portrait: "👩🏼", line: "Я приехала впервые за много лет. Хотела убедиться, что он наконец получит то, что заслужил." }],
              thomas: [{ speaker: "Томас", portrait: "🧑🏻", line: "Я знаю старые проходы и устройство часов. Но это не значит, что я убил Ардена." }],
              may: [{ speaker: "Мэй", portrait: "👩🏽", line: "Я принесла ему вино около 22:55. Почему он написал имя Элиза? Не знаю. Я ведь не умею читать по-французски." }, { speaker: "Детектив", portrait: "🕵️", line: "Имя написано обычными буквами. Почему вы решили, что записка была по-французски?" }],
            },
            revealDialogues: [
              { speaker: "София", portrait: "👩🏼", line: "Да, я ударила Ардена. Он смеялся, когда я спросила о дочери. Я увидела документы и ударила его. Он был жив, когда я ушла." },
              { speaker: "София", portrait: "👩🏼", line: "Я услышала шаги и спряталась. В кабинет вошла Мэй. Она увидела Ардена на полу и наклонилась к нему. Я ушла через служебный проход." },
              { speaker: "Детектив", portrait: "🕵️", line: "Мэй, вы вошли после Софии. Вы знали, что Арден ещё жив." },
              { speaker: "Мэй", portrait: "👩🏽", line: "Он подставил моего брата. Брат умер в тюрьме, а Арден собирался уничтожить последние доказательства. Когда он попытался встать, я взяла кочергу и ударила его второй раз." },
              { speaker: "Мэй", portrait: "👩🏽", line: "Я остановила часы на 23:17 и открыла окно. Томас помог сделать следы. Он никого не убивал." },
              { speaker: "Элиза", portrait: "👩🏻", line: "Я узнала, что София — моя мать, только вчера. Я не знаю, кого считать семьёй. Но знаю: Виктор Арден не был моим отцом." },
              { speaker: "Рассказчик", portrait: "🔥", line: "Через три месяца Элиза вернулась в закрытый отель, нашла последнее письмо Ардена и сожгла его. София ждала её у крыльца с двумя стаканчиками кофе." },
              { speaker: "Элиза", portrait: "👩🏻", line: "Мам?" },
              { speaker: "София", portrait: "👩🏼", line: "Да?" },
              { speaker: "Рассказчик", portrait: "🕰️", line: "В пустом кабинете часы наконец пошли. 23:17 осталось в прошлом." },
              { speaker: "Рассказчик", portrait: "📷", line: "София призналась в первом ударе, Мэй — в смертельном, Томас — в сокрытии следов. Перед отъездом детектив заметил под фотографией ещё одну записку: «София никогда не должна узнать, что произошло той ночью»." },
              { speaker: "Детектив", portrait: "🕵️", line: "Что произошло двадцать девять лет назад — и почему Арден боялся, что София узнает правду?" },
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
            profileName: "Nickname",
            profileAvatar: "Profile photo (image up to 2 MB)",
            profileSave: "Save profile",
            closeProfile: "Close",
            profileImageError: "Choose an image no larger than 2 MB.",
            profileSaveError: "This browser could not save the profile.",
            language: "Language",
            logo: "🕰 The Last Chime",
            account: "Account",
            accountName: "Detective",
            accountRole: "Player",
            guestsButton: "Hotel guests",
            playButton: "Play game",
            detective: "Detective",
            dialogueLabel: "Character dialogue",
            dialogueContinue: "Continue",
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
            openingDialogues: [
              { speaker: "Narrator", portrait: "🌨️", line: "A snowstorm has cut the old country hotel off from town. That evening, Victor Arden gathered five guests for dinner." },
              { speaker: "Victor Arden", portrait: "🧔🏻", line: "Tomorrow morning I am going to change something. And some of you will not like it." },
              { speaker: "Narrator", portrait: "🌨️", line: "At 11:17, the clock struck eleven times. After a pause, there was one more chime. Soon Arden was found dead in his locked study." },
              { speaker: "Detective", portrait: "🕵️", line: "The window is open, footprints lead to the forest, and the pocket watch stopped at 11:17. Too many coincidences." },
            ],
            studyDialogues: [
              { speaker: "Narrator", portrait: "🕯️", line: "A glass of wine and an open safe sit on the desk. Beside them are a family photograph and a note with the name “Eliza.”" },
              { speaker: "Detective", portrait: "🕵️", line: "The wine was not poisoned. Arden died from a blow to the head, but the weapon is missing." },
              { speaker: "Detective", portrait: "🕵️", line: "I will examine the clock, window, fireplace, and documents. Any detail could change the case." },
            ],
            clueDialogues: [
              [{ speaker: "Detective", portrait: "🕵️", line: "This clock has not worked for ten years. Someone made the mechanism strike one extra time by hand." }],
              [{ speaker: "Detective", portrait: "🕵️", line: "The footprints lead from the window to the forest, but none lead to the window. The escape was staged." }],
              [{ speaker: "Detective", portrait: "🕵️", line: "A tiny spot of blood remains on the fireplace. Someone struck Arden, but that blow was not enough to kill him." }],
              [{ speaker: "Detective", portrait: "🕵️", line: "The back of the photograph reads: “Her real name is Eliza Lange.” Eliza is Sophia's daughter." }],
              [{ speaker: "Detective", portrait: "🕵️", line: "The pocket watch was stopped after the real time of death. 11:17 was staged." }],
            ],
            interviewDialogues: {
              eliza: [{ speaker: "Eliza", portrait: "👩🏻", line: "I hated him. But I did not kill him. I was in the library for most of the evening." }],
              mark: [{ speaker: "Mark", portrait: "🧔🏻", line: "At 11:10 I was in the wine cellar. The cameras went off? I cannot explain that." }],
              sofia: [{ speaker: "Sophia", portrait: "👩🏼", line: "I came here for the first time in years. I wanted to make sure he finally got what he deserved." }],
              thomas: [{ speaker: "Thomas", portrait: "🧑🏻", line: "I know the old passages and how the clock works. That does not mean I killed Arden." }],
              may: [{ speaker: "May", portrait: "👩🏽", line: "I brought him wine at about 10:55. Why did he write Eliza? I do not know. I cannot read French." }, { speaker: "Detective", portrait: "🕵️", line: "The name is written in ordinary letters. Why did you think the note was in French?" }],
            },
            revealDialogues: [
              { speaker: "Sophia", portrait: "👩🏼", line: "Yes, I struck Arden. He laughed when I asked about my daughter. I saw the documents and hit him. He was alive when I left." },
              { speaker: "Sophia", portrait: "👩🏼", line: "I heard footsteps and hid. May came in, saw Arden on the floor, and leaned over him. I left through a service passage." },
              { speaker: "Detective", portrait: "🕵️", line: "May, you came in after Sophia. You knew Arden was still alive." },
              { speaker: "May", portrait: "👩🏽", line: "He framed my brother. My brother died in prison, and Arden planned to destroy the last evidence. When he tried to stand, I took the poker and struck him a second time." },
              { speaker: "May", portrait: "👩🏽", line: "I stopped the clock at 11:17 and opened the window. Thomas made the footprints. He did not kill anyone." },
              { speaker: "Eliza", portrait: "👩🏻", line: "I learned yesterday that Sophia is my mother. I do not know whom to call family. But I know Victor Arden was not my father." },
              { speaker: "Narrator", portrait: "🔥", line: "Three months later, Eliza returned to the closed hotel, found Arden's last letter, and burned it. Sophia was waiting outside with two cups of coffee." },
              { speaker: "Eliza", portrait: "👩🏻", line: "Mom?" },
              { speaker: "Sophia", portrait: "👩🏼", line: "Yes?" },
              { speaker: "Narrator", portrait: "🕰️", line: "In the empty study, the clock finally began to move. 11:17 was in the past." },
              { speaker: "Narrator", portrait: "📷", line: "Sophia admitted the first blow, May the fatal one, and Thomas the cover-up. Before leaving, the detective found another note beneath the photograph: “Sophia must never learn what happened that night.”" },
              { speaker: "Detective", portrait: "🕵️", line: "What happened twenty-nine years ago, and why was Arden afraid Sophia would learn the truth?" },
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
          profileOpen.setAttribute("aria-label", t().profile);
          document.getElementById("profile-name-label").textContent = t().profileName;
          document.getElementById("profile-avatar-label").textContent = t().profileAvatar;
          document.getElementById("profile-save").textContent = t().profileSave;
          document.getElementById("profile-heading").textContent = t().profile;
          document.getElementById("close-profile").textContent = t().closeProfile;
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
          const preferences = JSON.parse(localStorage.getItem(`game-profile-${user.id}`) || "{}");
          document.getElementById("account-name").textContent = preferences.displayName || user.username;
          showAvatar(accountAvatar, preferences.avatarData);
          profileNameInput.value = preferences.displayName || user.username;
          showAvatar(profileAvatarPreview, preferences.avatarData);
          profileAvatarPreview.dataset.imageData = preferences.avatarData || "";
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

        function addNovelDialogue(speaker, portrait = "🕵️", entries = null) {
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
          const speakerNode = text(copyPanel, "h3", speaker, "novel-speaker");
          const lineNode = text(copyPanel, "p", t().placeholderDialogue, "novel-line");
          lineNode.setAttribute("aria-live", "polite");
          const sequence = entries && entries.length ? entries : [{ speaker, portrait, line: t().placeholderDialogue }];
          const nextButton = text(copyPanel, "button", t().dialogueContinue, "action-button");
          nextButton.type = "button";
          nextButton.addEventListener("click", () => {
            sequenceIndex = Math.min(sequenceIndex + 1, sequence.length - 1);
            renderEntry();
          });
          let sequenceIndex = 0;
          function renderEntry() {
            const entry = sequence[sequenceIndex];
            speakerNode.textContent = entry.speaker;
            lineNode.textContent = entry.line;
            image.textContent = entry.portrait || portrait;
            nextButton.hidden = sequenceIndex === sequence.length - 1;
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
          addNovelDialogue(t().detective, "🕵️", t().studyDialogues);
          const evidenceActions = document.createElement("div");
          evidenceActions.className = "action-grid";
          t().areas.forEach((area, index) => {
            const examine = button(evidenceActions, `${t().examine}: ${area.title}`, "inspect", index);
            examine.disabled = state.clues.has(index);
          });
          screen.append(evidenceActions);
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
          addNovelDialogue(t().detective, "🕵️", t().openingDialogues);
          button(screen, t().start, "start").classList.add("start-button");
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
            addNovelDialogue(t().detective, "🕵️", t().clueDialogues[index]);
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
          addNovelDialogue(details.name, portraits[suspect.id] || "👤", t().interviewDialogues[suspect.id]);
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
            if (verdict.correct) addNovelDialogue(t().detective, "🕵️", t().revealDialogues);
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

        profileOpen.addEventListener("click", () => {
          const user = state.user;
          const preferences = user
            ? JSON.parse(localStorage.getItem(`game-profile-${user.id}`) || "{}")
            : {};
          profileNameInput.value = preferences.displayName || user?.username || t().accountName;
          profileFileInput.value = "";
          profileFeedback.textContent = "";
          showAvatar(profileAvatarPreview, preferences.avatarData);
          profileAvatarPreview.dataset.imageData = preferences.avatarData || "";
          profileDialog.showModal();
          profileNameInput.focus();
        });

        profileFileInput.addEventListener("change", () => {
          const file = profileFileInput.files[0];
          if (!file) return;
          if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
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

        profileForm.addEventListener("submit", (event) => {
          event.preventDefault();
          if (!state.user) return;
          const displayName = profileNameInput.value.trim().slice(0, 32);
          if (!displayName) {
            profileNameInput.focus();
            return;
          }
          const oldPreferences = JSON.parse(localStorage.getItem(`game-profile-${state.user.id}`) || "{}");
          const preferences = {
            displayName,
            avatarData: profileAvatarPreview.dataset.imageData || oldPreferences.avatarData || "",
          };
          try {
            localStorage.setItem(`game-profile-${state.user.id}`, JSON.stringify(preferences));
            document.getElementById("account-name").textContent = displayName;
            showAvatar(accountAvatar, preferences.avatarData);
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
