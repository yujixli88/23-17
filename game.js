const app = document.getElementById('app');

async function loadGame() {
  const response = await fetch('/api/game');
  if (!response.ok) {
    app.innerHTML = '<h1>Ошибка</h1><p>Не удалось загрузить игру.</p>';
    return;
  }

  const data = await response.json();
  renderGame(data);
}

function renderGame(data) {
  const suspectsMarkup = data.suspects
    .map(
      (suspect) => `
        <li>
          <strong>${suspect.name}</strong> — ${suspect.role}<br>
          <small>${suspect.motive}</small>
          <button class="suspect-btn" data-id="${suspect.id}">Выбрать</button>
        </li>
      `
    )
    .join('');

  const cluesMarkup = data.clues
    .map((clue) => `<li>${clue}</li>`)
    .join('');

  app.innerHTML = `
    <h1>${data.title}</h1>
    <div class="subtitle">${data.genre}</div>
    <div class="objective"><strong>Задача:</strong> ${data.objective}</div>
    <p>${data.intro}</p>

    <div class="grid">
      <section class="card">
        <h3>Подозреваемые</h3>
        <ul class="suspect-list">${suspectsMarkup}</ul>
      </section>

      <section class="card">
        <h3>Улики</h3>
        <ul class="clue-list">${cluesMarkup}</ul>
      </section>
    </div>

    <div id="result"></div>
  `;

  document.querySelectorAll('.suspect-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const suspectId = button.dataset.id;
      const result = await accuse(suspectId);
      showResult(result);
    });
  });
}

async function accuse(suspectId) {
  const response = await fetch(`/api/accuse/${suspectId}`, { method: 'POST' });
  return response.json();
}

function showResult(result) {
  const resultBox = document.getElementById('result');
  if (!resultBox) return;

  resultBox.className = `result ${result.correct ? '' : 'error'}`;
  resultBox.innerHTML = `
    <h3>${result.title}</h3>
    <p>${result.message}</p>
    <p>${result.summary}</p>
  `;
}

window.addEventListener('DOMContentLoaded', loadGame);
