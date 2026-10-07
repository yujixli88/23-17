let currentIndex = 0;
let glitters = 0;
let currentRank = "Базовый уровень";

// Проверяем при загрузке игры, залогинен ли юзер
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
    { speaker: "ДИРЕКТОР", text: "Занавес поднимается. Вы готовы увидеть то, что скрывает этот цирк?" },
    { speaker: "ВЫ", text: "У меня не было выбора. Дверь захлопнулась снаружи." },
    { speaker: "ДИРЕКТОР", text: "О, двери здесь открываются только для тех, кто согласен сыграть по нашим правилам..." }
];

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function nextLine() {
    currentIndex++;
    if (currentIndex >= story.length) {
        currentIndex = 0;
    }
    document.getElementById('speaker').innerText = story[currentIndex].speaker;
    document.getElementById('text').innerText = story[currentIndex].text;
}

function claimAchievement(id, amount) {
    const ach = document.getElementById(ach-${id});
    if (ach.classList.contains('claimed')) return;

    ach.classList.remove('completed');
    ach.classList.add('claimed');
    document.getElementById(btn-claim-${id}).remove();

    glitters += amount;
    document.getElementById('glitters-display').innerText = glitters;
}

function goToMenu() {
    window.location.href = '/';
}