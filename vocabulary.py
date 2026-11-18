"""Crime vocabulary practice content for the detective game."""


VOCABULARY_EXERCISES = (
    {
        "id": 1,
        "title": "Match the crime with the definition / Соотнесите преступление и определение",
        "instruction": "Match each crime (1–10) with a definition (a–j).",
        "items": [
            "1. theft    2. robbery    3. burglary    4. murder    5. fraud",
            "6. kidnapping    7. shoplifting    8. vandalism    9. arson    10. bribery",
        ],
        "options": [
            "a) deliberately setting fire to a building",
            "b) stealing goods from a shop",
            "c) taking someone away illegally and keeping them prisoner",
            "d) stealing money or property using force or threat",
            "e) deliberately killing another person",
            "f) damaging public or private property",
            "g) entering a building illegally in order to steal",
            "h) stealing something belonging to another person",
            "i) obtaining money by deceiving people",
            "j) giving money or gifts to influence someone",
        ],
        "answer": "1-h, 2-d, 3-g, 4-e, 5-i, 6-c, 7-b, 8-f, 9-a, 10-j",
    },
    {
        "id": 2,
        "title": "Who does what? / Кто что делает?",
        "instruction": "Match each description with a person or group.",
        "items": [
            "1. A person who may have committed a crime",
            "2. A person who sees a crime happen",
            "3. A person who suffers because of a crime",
            "4. A person found guilty and serving a sentence",
            "5. A person who represents someone in court",
            "6. A person who decides what punishment should be given",
            "7. A group who decide whether someone is guilty",
            "8. A person who investigates crimes and arrests criminals",
            "9. A person who accuses someone in court",
            "10. A person who commits a crime",
        ],
        "options": [
            "criminal — victim — witness — suspect — judge",
            "jury — lawyer — police officer — prosecutor — prisoner",
        ],
        "answer": "1 suspect, 2 witness, 3 victim, 4 prisoner, 5 lawyer, 6 judge, 7 jury, 8 police officer, 9 prosecutor, 10 criminal",
        "drag_pairs": [
            {"id": "1", "prompt": "May have committed a crime", "answer": "suspect"},
            {"id": "2", "prompt": "Sees a crime happen", "answer": "witness"},
            {"id": "3", "prompt": "Suffers because of a crime", "answer": "victim"},
            {"id": "4", "prompt": "Found guilty and serving a sentence", "answer": "prisoner"},
            {"id": "5", "prompt": "Represents someone in court", "answer": "lawyer"},
            {"id": "6", "prompt": "Decides the punishment", "answer": "judge"},
            {"id": "7", "prompt": "Group deciding whether someone is guilty", "answer": "jury"},
            {"id": "8", "prompt": "Investigates crimes and arrests criminals", "answer": "police officer"},
            {"id": "9", "prompt": "Accuses someone in court", "answer": "prosecutor"},
            {"id": "10", "prompt": "Commits a crime", "answer": "criminal"},
        ],
        "drag_options": ["criminal", "victim", "witness", "suspect", "judge", "jury", "lawyer", "police officer", "prosecutor", "prisoner"],
    },
    {
        "id": 3,
        "title": "Crime or punishment? / Преступление или наказание?",
        "instruction": "Put the words into two groups: crimes and punishments. Then add three more words to each category.",
        "items": [
            "fine, murder, imprisonment, theft, community service, burglary, probation, fraud, prison sentence, vandalism, life imprisonment, arrest",
        ],
        "answer": "Crimes: murder, theft, burglary, fraud, vandalism. Punishments: fine, imprisonment, community service, probation, prison sentence, life imprisonment. Arrest is a legal action, not a punishment. Examples: robbery, kidnapping / a warning, a suspended sentence.",
        "drag_pairs": [
            {"id": "1", "prompt": "murder", "answer": "crime"}, {"id": "2", "prompt": "theft", "answer": "crime"},
            {"id": "3", "prompt": "burglary", "answer": "crime"}, {"id": "4", "prompt": "fraud", "answer": "crime"},
            {"id": "5", "prompt": "vandalism", "answer": "crime"}, {"id": "6", "prompt": "fine", "answer": "punishment"},
            {"id": "7", "prompt": "imprisonment", "answer": "punishment"}, {"id": "8", "prompt": "community service", "answer": "punishment"},
            {"id": "9", "prompt": "probation", "answer": "punishment"}, {"id": "10", "prompt": "life imprisonment", "answer": "punishment"},
        ],
        "drag_options": ["crime", "punishment"],
    },
    {
        "id": 4,
        "title": "Complete the collocations / Завершите словосочетания",
        "instruction": "Use: commit / break / pay / serve / catch / face / go / release.",
        "items": [
            "1. __ a crime    2. __ the law    3. __ a fine    4. __ a prison sentence",
            "5. __ a criminal    6. __ charges    7. __ to court    8. __ a prisoner",
            "Bonus: write four sentences using the expressions.",
        ],
        "answer": "1 commit, 2 break, 3 pay, 4 serve, 5 catch, 6 face, 7 go, 8 release.",
        "drag_pairs": [
            {"id": "1", "prompt": "__ a crime", "answer": "commit"}, {"id": "2", "prompt": "__ the law", "answer": "break"},
            {"id": "3", "prompt": "__ a fine", "answer": "pay"}, {"id": "4", "prompt": "__ a prison sentence", "answer": "serve"},
            {"id": "5", "prompt": "__ a criminal", "answer": "catch"}, {"id": "6", "prompt": "__ charges", "answer": "face"},
            {"id": "7", "prompt": "__ to court", "answer": "go"}, {"id": "8", "prompt": "__ a prisoner", "answer": "release"},
        ],
        "drag_options": ["commit", "break", "pay", "serve", "catch", "face", "go", "release"],
    },
    {
        "id": 5,
        "title": "What's the crime? / Какое это преступление?",
        "instruction": "Read each situation and identify the crime.",
        "items": [
            "A. Someone secretly takes a wallet from a person's bag on a crowded bus.",
            "B. Someone enters a house at night through a window and steals a laptop.",
            "C. Someone deliberately sets fire to an empty warehouse.",
            "D. Someone creates a fake website and takes people's bank details.",
            "E. Someone paints graffiti all over a public building.",
            "F. Someone takes a person by force and demands money from their family.",
        ],
        "answer": "A theft, B burglary, C arson, D fraud, E vandalism, F kidnapping.",
        "drag_pairs": [
            {"id": "A", "prompt": "Wallet secretly taken on a crowded bus", "answer": "theft"},
            {"id": "B", "prompt": "Enters a house through a window and steals", "answer": "burglary"},
            {"id": "C", "prompt": "Deliberately sets fire to a warehouse", "answer": "arson"},
            {"id": "D", "prompt": "Fake website takes bank details", "answer": "fraud"},
            {"id": "E", "prompt": "Paints graffiti on a public building", "answer": "vandalism"},
            {"id": "F", "prompt": "Takes a person and demands money", "answer": "kidnapping"},
        ],
        "drag_options": ["theft", "burglary", "arson", "fraud", "vandalism", "kidnapping"],
    },
    {
        "id": 6,
        "title": "Complete the mini-dialogues / Дополните мини-диалоги",
        "instruction": "Use: suspect, evidence, witness, arrested, guilty, innocent, trial, sentence.",
        "items": [
            "Detective: We have enough __ to charge him. / Police officer: Did anyone see what happened? / Detective: Yes, we have a __.",
            "Lawyer: My client is __. He didn't commit the crime. / Judge: The __ will begin next Monday.",
            "Police officer: The __ was __ yesterday. / Journalist: What __ could he receive if he's found __?",
        ],
        "answer": "evidence, witness / innocent, trial / suspect, arrested, sentence, guilty.",
        "drag_pairs": [
            {"id": "1", "prompt": "Enough __ to charge him", "answer": "evidence"}, {"id": "2", "prompt": "Someone who saw what happened", "answer": "witness"},
            {"id": "3", "prompt": "My client is __", "answer": "innocent"}, {"id": "4", "prompt": "The __ will begin next Monday", "answer": "trial"},
            {"id": "5", "prompt": "The __ was __ yesterday", "answer": "suspect"}, {"id": "6", "prompt": "The suspect was __ yesterday", "answer": "arrested"},
            {"id": "7", "prompt": "What __ could he receive?", "answer": "sentence"}, {"id": "8", "prompt": "If he's found __", "answer": "guilty"},
        ],
        "drag_options": ["evidence", "witness", "innocent", "trial", "suspect", "arrested", "sentence", "guilty"],
    },
    {
        "id": 7,
        "title": "Crime scene vocabulary / Лексика места преступления",
        "instruction": "Choose the odd one out and explain why.",
        "items": [
            "1. fingerprint — footprint — evidence — sandwich",
            "2. detective — suspect — witness — burglar",
            "3. judge — jury — lawyer — policeman",
            "4. prison — cell — sentence — supermarket",
            "5. knife — weapon — gun — witness",
        ],
        "answer": "1 sandwich (not crime-scene evidence); 2 burglar (a criminal, not a role in an investigation); 3 policeman (the others work in court); 4 supermarket (not connected with prison); 5 witness (a person, not an object or weapon).",
        "drag_pairs": [
            {"id": "1", "prompt": "fingerprint · footprint · evidence · __", "answer": "sandwich"},
            {"id": "2", "prompt": "detective · suspect · witness · __", "answer": "burglar"},
            {"id": "3", "prompt": "judge · jury · lawyer · __", "answer": "policeman"},
            {"id": "4", "prompt": "prison · cell · sentence · __", "answer": "supermarket"},
            {"id": "5", "prompt": "knife · weapon · gun · __", "answer": "witness"},
        ],
        "drag_options": ["sandwich", "burglar", "policeman", "supermarket", "witness"],
    },
    {
        "id": 8,
        "title": "Word formation / Образуйте слово",
        "instruction": "Complete each sentence with the correct form of the word in brackets.",
        "items": [
            "1. The police arrested the __ yesterday. (suspect)",
            "2. The court found him __ of murder. (guilt)",
            "3. She was given a five-year prison __. (sentence)",
            "4. The police are investigating the __. (crime)",
            "5. He was accused of __ several houses. (burglar)",
            "6. The judge ordered his immediate __. (release)",
            "7. The victim gave a detailed __ of the criminal. (describe)",
            "8. The police found important __ at the crime scene. (evident)",
        ],
        "answer": "1 suspect, 2 guilty, 3 sentence, 4 crime, 5 burgling, 6 release, 7 description, 8 evidence.",
        "drag_pairs": [
            {"id": "1", "prompt": "The police arrested the __", "answer": "suspect"}, {"id": "2", "prompt": "The court found him __", "answer": "guilty"},
            {"id": "3", "prompt": "A five-year prison __", "answer": "sentence"}, {"id": "4", "prompt": "Investigating the __", "answer": "crime"},
            {"id": "5", "prompt": "Accused of __ several houses", "answer": "burgling"}, {"id": "6", "prompt": "Ordered his immediate __", "answer": "release"},
            {"id": "7", "prompt": "Gave a detailed __", "answer": "description"}, {"id": "8", "prompt": "Found important __", "answer": "evidence"},
        ],
        "drag_options": ["suspect", "guilty", "sentence", "crime", "burgling", "release", "description", "evidence"],
    },
    {
        "id": 9,
        "title": "What punishment would you give? / Какое наказание выбрать?",
        "instruction": "Discuss the cases in pairs or groups. Use the sentence starters below.",
        "items": [
            "1. A teenager steals a phone from another student.",
            "2. Someone repeatedly shoplifts expensive clothes.",
            "3. A driver causes an accident by driving dangerously.",
            "4. Someone hacks into a company's computer system and steals money.",
            "5. Someone deliberately destroys public property.",
            "Useful language: I think the punishment should be… / In my opinion, they should… / They deserve… / I don't think imprisonment is necessary because… / A more appropriate punishment would be…",
        ],
        "answer": "Open discussion: justify a proportionate punishment for each case.",
        "drag_pairs": [
            {"id": "1", "prompt": "Teenager steals a phone", "answer": "community service"},
            {"id": "2", "prompt": "Repeatedly shoplifts expensive clothes", "answer": "fine"},
            {"id": "3", "prompt": "Dangerous driving causes an accident", "answer": "driving ban"},
            {"id": "4", "prompt": "Hacks a company and steals money", "answer": "prison sentence"},
            {"id": "5", "prompt": "Deliberately destroys public property", "answer": "probation"},
        ],
        "drag_options": ["community service", "fine", "driving ban", "prison sentence", "probation"],
    },
    {
        "id": 10,
        "title": "Mini mystery — vocabulary in context / Мини-расследование",
        "instruction": "Read the case and answer the questions.",
        "items": [
            "Last night, a valuable painting disappeared from a private gallery. The police found no broken windows or damaged doors. A security camera showed three people entering: the owner, a cleaner and a security guard. The owner says the painting was insured. The cleaner says she saw nothing. The security guard says he was checking the alarm system at the time of the theft.",
            "1. What crime has been committed?  2. Who are the possible suspects?  3. Who could be a witness?  4. What evidence would the police look for?  5. Who do you think is guilty?  6. What punishment should they receive?",
        ],
        "answer": "Possible answer: theft; the owner, cleaner and security guard are possible suspects; anyone who saw activity at the gallery could be a witness; police could look for fingerprints, footprints, camera footage, alarm logs and insurance records. The final suspect and punishment should be justified with evidence.",
        "drag_pairs": [
            {"id": "1", "prompt": "What crime was committed?", "answer": "theft"},
            {"id": "2", "prompt": "Who are the possible suspects?", "answer": "owner, cleaner, security guard"},
            {"id": "3", "prompt": "Who could be a witness?", "answer": "a gallery visitor"},
            {"id": "4", "prompt": "What evidence should police look for?", "answer": "fingerprints, footage and alarm logs"},
            {"id": "5", "prompt": "Who is the most likely suspect?", "answer": "security guard"},
            {"id": "6", "prompt": "What punishment could they receive?", "answer": "prison sentence"},
        ],
        "drag_options": ["theft", "owner, cleaner, security guard", "a gallery visitor", "fingerprints, footage and alarm logs", "security guard", "prison sentence"],
    },
)


VOCABULARY_GAMES = (
    {
        "id": "crime-quiz",
        "title": "Crime quiz",
        "description": "Choose the crime that matches the situation.",
        "questions": (
            {"prompt": "Someone secretly takes a wallet from a bag on a crowded bus.", "options": ("theft", "burglary", "arson", "bribery"), "answer": "theft"},
            {"prompt": "Someone enters a house through a window and steals a laptop.", "options": ("fraud", "burglary", "vandalism", "kidnapping"), "answer": "burglary"},
            {"prompt": "Someone creates a fake website and takes bank details.", "options": ("fraud", "robbery", "murder", "shoplifting"), "answer": "fraud"},
            {"prompt": "Someone deliberately sets fire to an empty warehouse.", "options": ("arson", "theft", "bribery", "vandalism"), "answer": "arson"},
            {"prompt": "Someone takes a person by force and demands money from the family.", "options": ("kidnapping", "burglary", "fraud", "shoplifting"), "answer": "kidnapping"},
        ),
    },
    {
        "id": "word-detective",
        "title": "Word detective",
        "description": "Complete the collocation and earn a point.",
        "questions": (
            {"prompt": "__ a crime", "options": ("commit", "pay", "catch", "release"), "answer": "commit"},
            {"prompt": "__ the law", "options": ("break", "serve", "face", "go"), "answer": "break"},
            {"prompt": "__ a fine", "options": ("pay", "catch", "release", "commit"), "answer": "pay"},
            {"prompt": "__ a prison sentence", "options": ("serve", "break", "go", "pay"), "answer": "serve"},
            {"prompt": "__ charges", "options": ("face", "release", "catch", "commit"), "answer": "face"},
        ),
    },
    {
        "id": "mini-mystery",
        "title": "Mini mystery",
        "description": "Read the clue and identify the most likely crime.",
        "questions": (
            {"prompt": "A shop camera shows a teenager putting a jacket into a backpack and leaving without paying.", "options": ("shoplifting", "murder", "bribery", "burglary"), "answer": "shoplifting"},
            {"prompt": "A public wall is covered with fresh paint after someone deliberately damaged it.", "options": ("vandalism", "fraud", "theft", "kidnapping"), "answer": "vandalism"},
            {"prompt": "A company manager gives an official money to win a contract.", "options": ("bribery", "arson", "robbery", "burglary"), "answer": "bribery"},
            {"prompt": "A masked person threatens a cashier and takes money from the register.", "options": ("robbery", "shoplifting", "fraud", "vandalism"), "answer": "robbery"},
            {"prompt": "A person deliberately kills another person.", "options": ("murder", "theft", "arson", "burglary"), "answer": "murder"},
        ),
    },
)


def get_vocabulary_exercises() -> list[dict]:
    """Return the practice content shown in the authenticated game."""
    return [dict(exercise) for exercise in VOCABULARY_EXERCISES]


def get_vocabulary_games() -> list[dict]:
    """Return interactive vocabulary game data for the browser client."""
    return [
        {
            **game,
            "questions": [dict(question) for question in game["questions"]],
        }
        for game in VOCABULARY_GAMES
    ]
