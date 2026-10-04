const startButton = document.querySelector("#start-game");
const statusMessage = document.querySelector("#game-status");

startButton.addEventListener("click", async () => {
	startButton.disabled = true;
	statusMessage.textContent = "Запускаем...";

	try {
		const response = await fetch("/game");
		if (!response.ok) {
			throw new Error("Не удалось запустить игру");
		}

		const result = await response.json();
		statusMessage.textContent = result.status;
	} catch {
		statusMessage.textContent = "Не удалось связаться с сервером";
	} finally {
		startButton.disabled = false;
	}
});
