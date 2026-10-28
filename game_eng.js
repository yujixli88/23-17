let currentIndex = 0;
let glitters = 0;
let currentRank = "Basic level";

window.onload = function() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('profile-status').innerText = user.email;
        document.getElementById('rank-display').innerText = user.rank_level;
        document.getElementById('glitters-display').innerText = user.glitters;
        glitters = user.glitters;
    }
}

const story = [
    { speaker: "voice", text: "️ “The Last Chime at 11:17 PM”" },
    { speaker: "At 10:40 PM", text: "Arden announces:\n— Tomorrow morning, I’m going to make a few changes. And some of you are not going to like them one bit.\nEveryone takes his words as yet another act of manipulation." },
    { speaker: "At 11:05 PM", text: "️ Arden retires to his study. " },
    { speaker: "At 11:17 PM", text: "️the chime of an antique grandfather clock echoes throughout the hotel. " },
    { speaker: "At 11:17 PM", text: "Eleven strikes."}
    { speaker: "At 11:17 PM", text: "️And then — one more.The chime of an antique grandfather clock echoes throughout the hotel." },
    { speaker: "At 11:17 PM", text: "️Eleven strikes. " },
    { speaker: "At 11:17 PM", text: "️The twelfth. " },
    { speaker: "At 11:17 PM", text: "️Only the housemaid notices something strange: that clock has been broken for ten years. " },
    { speaker: "At 11:17 PM", text: "️A few minutes later, the study door is found locked from the inside." },
    { speaker: "At 11:17 PM", text: "️Arden is sitting at his desk." },
    { speaker: "At 11:17 PM", text: "️Dead. " },
    { speaker: "At 11:17 PM", text: "️On the desk:\nA glass of red wine;\nAn open safe;\nAn old family photograph;\nA sheet of paper bearing a handwritten name: “Eliza”;\nThe victim’s pocket watch, stopped at 11:17 PM." },
    { speaker: "At 11:17", text: "️The window is open.\nFootprints are visible in the snow beneath it.\nBut they lead away from the window toward the forest.\nThere are no footprints leading toward the window." },
    { speaker: "👥 Suspects", text: "️1. Eliza Arden — the victim’s daughter, 29.\nShe claims she spent the entire evening in the library.\nHer motive is obvious: her father was planning to disinherit her.\nBut she says:\n— I hated him. But I didn’t kill him.\nAnd indeed, there is no blood on her clothes, and witnesses saw her in the library for almost the entire evening." },
    { speaker: "👥 Suspects", text: "️3. Sophia Lange — the ex-wife, 51.\nAnd indeed, there is no blood on her clothes, and witnesses saw her in the library for almost the entire evening.\nTwenty years ago, Arden destroyed her reputation, costing her career.\nShe has returned to the hotel for the first time in many years.\nWhen asked why she came, she replies:\n— I wanted to make sure he finally got what he deserved." },
    { speaker: "👥 Suspects", text: "️4. Thomas Reed — the hotel manager, 36.\nHe has worked here since childhood.\nHe knows every secret passage, every old lock, and exactly how the clocks work.\nAnd he was the first to discover the body.\nFar too convenient." },
    { speaker: "👥 Suspects", text: "️5. May Hall — the housemaid, 24.\nShe was the last person to see Arden alive.\nShe brought him wine in his study at around 10:55 PM.\nWhen asked why Arden had written the name Eliza, she replies:\n— I don’t know. I can’t even read French.\nThe detective looks at her.\nBecause the name “Eliza” is written in perfectly ordinary letters." },
    { speaker: "🔎 And now things get really interesting", text: "️The autopsy reveals that Arden was not poisoned by the wine.\nThe cause of death was a severe blow to the head.
        There is no murder weapon in the study.
        However, a tiny spot of blood is found on the fireplace.
        Barely the size of a fingernail." },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },'
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },
    { speaker: "", text: "️ " },

    ];

    function renderLine() {
        document.getElementById('speaker').innerText = story[currentIndex].speaker;
        document.getElementById('text').innerText = story[currentIndex].text;
    }

    renderLine();

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    }

    function nextLine() {
        if (currentIndex < story.length - 1) {
            currentIndex++;
            renderLine();
        }
    }

    function claimAchievement(id, amount) {
        const ach = document.getElementById(`ach-${id}`);
        if (ach.classList.contains('claimed')) return;

        ach.classList.remove('completed');
        ach.classList.add('claimed');
        document.getElementById(`btn-claim-${id}`).remove();

        glitters += amount;
        document.getElementById('glitters-display').innerText = glitters;
    }

    function goToMenu() {
        window.location.href = '/';
    }