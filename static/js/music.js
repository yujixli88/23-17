const backgroundMusic = document.getElementById("background-music");
const volumeSlider = document.getElementById("music-volume");
const volumeStorageKey = "musicVolume";
const savedVolume = localStorage.getItem(volumeStorageKey);
const storedVolume = Number(savedVolume);
const initialVolume = savedVolume !== null && Number.isFinite(storedVolume)
    ? Math.min(1, Math.max(0, storedVolume))
    : 0.5;

function updateVolume(volume) {
    backgroundMusic.volume = volume;
    if (volumeSlider) {
        volumeSlider.value = String(volume);
        volumeSlider.style.setProperty("--volume-level", `${volume * 100}%`);
    }
    localStorage.setItem(volumeStorageKey, String(volume));
}

updateVolume(initialVolume);

if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
        updateVolume(Number(volumeSlider.value));
    });
}

async function startBackgroundMusic() {
    try {
        await backgroundMusic.play();
        document.removeEventListener("pointerdown", startBackgroundMusic);
        document.removeEventListener("keydown", startBackgroundMusic);
    } catch (error) {
        if (error.name !== "NotAllowedError") {
            console.error("Background music could not be played.", error);
        }
    }
}

document.addEventListener("pointerdown", startBackgroundMusic);
document.addEventListener("keydown", startBackgroundMusic);
startBackgroundMusic();
