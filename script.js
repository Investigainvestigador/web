
/* File: script.js */
const setupForm = document.getElementById('setup-form');
const configSection = document.getElementById('config');
const diceSection = document.getElementById('dice-section');
const orderInstruction = document.getElementById('order-instruction');
const diceCounters = document.getElementById('dice-counters');
const rollDiceBtn = document.getElementById('roll-dice');
const toProblemBtn = document.getElementById('to-problem');
const orderResults = document.getElementById('order-results');
const playerNumber = document.getElementById('player-number');
const problemSection = document.getElementById('problem-section');
const problemForm = document.getElementById('problem-form');
const deckSection = document.getElementById('deck-section');
const deckForm = document.getElementById('deck-form');
const deckOptions = document.getElementById('deck-options');
const turnLabel = document.getElementById('turn-label');
const gameSection = document.getElementById('game-section');
const playerTurn = document.getElementById('player-turn');
const timerDisplay = document.getElementById('timer');
const startRoll = document.getElementById('start-roll');

let numPlayers, rolls = [], currentPlayer = 0, nextTurn, selectedProblem;
const chosenDecks = [];

setupForm.addEventListener('submit', e => {
  e.preventDefault();
  numPlayers = +document.querySelector('input[name="players"]:checked').value;
  configSection.classList.add('hidden');
  diceSection.classList.remove('hidden');
  orderInstruction.textContent = `Elige tu turno (1 a ${numPlayers}) decidelo con tus compañeros y luego dale a Continuar.`;
  toProblemBtn.textContent = 'Continuar';
  diceCounters.innerHTML = Array.from({ length: numPlayers }, (_, i) =>
    `<div>Turno ${i+1}: obtuvo <span id="roll-${i}">-</span></div>`
  ).join('');
});

rollDiceBtn.addEventListener('click', () => {
  rolls = [];
  for (let i = 0; i < numPlayers; i++) {
    const total = Math.min(Math.max(
      [1, 2, 3].reduce(acc => acc + Math.ceil(Math.random() * 6), 0),
      3
    ), 18);
    rolls.push(total);
    document.getElementById(`roll-${i}`).textContent = total;
  }
  const ordered = rolls
    .map((r, i) => ({ player: i + 1, roll: r }))
    .sort((a, b) => b.roll - a.roll);
  orderResults.textContent = ordered
    .map((o, idx) => `Turno ${idx + 1}: Jugador ${o.player}`)
    .join('\n');
  playerNumber.textContent = `Este es tu número de jugador: `;
  toProblemBtn.classList.remove('hidden');
});

toProblemBtn.addEventListener('click', () => {
  diceSection.classList.add('hidden');
  problemSection.classList.remove('hidden');
});

problemForm.addEventListener('submit', e => {
  e.preventDefault();
  selectedProblem = document.querySelector('input[name="problem"]:checked').value;
  problemSection.classList.add('hidden');
  deckSection.classList.remove('hidden');
  currentPlayer = rolls.findIndex(r => r === Math.max(...rolls));
  nextTurn = 1;
  renderDeckOptions();
});

deckForm.addEventListener('submit', e => {
  e.preventDefault();
  const choice = document.querySelector('input[name="deck"]:checked').value;
  chosenDecks.push(choice);
  nextTurn++;
  if (nextTurn <= numPlayers) {
    renderDeckOptions();
  } else {
    deckSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    updateTurnLabel();
  }
});

function addDeckClickListeners() {
  deckOptions.querySelectorAll('.deck-option').forEach(label => {
    label.addEventListener('click', () => {
      deckOptions.querySelectorAll('.deck-option').forEach(l => l.classList.remove('clicked'));
      label.classList.add('clicked');
      label.querySelector('input').checked = true;
    });
  });
}

function renderDeckOptions() {
  turnLabel.textContent = `Jugador ${nextTurn}: Elige tu mazo`;
  const options = selectedProblem === 'intoxicacion'
    ? [
        { value: 'deductivo', text: 'Deductivo', color: '#007BFF' },
        { value: 'analitico', text: 'Analítico', color: '#FFC107' },
        { value: 'empirico', text: 'Empírico', color: '#8B0000' }
      ]
    : [
        { value: 'inductivo', text: 'Inductivo', color: '#28A745' },
        { value: 'sintetico', text: 'Sintético', color: '#FD7E14' },
        { value: 'cientifico', text: 'Científico', color: '#6F42C1' }
      ];
  deckOptions.innerHTML = options.map(opt => {
    const disabled = chosenDecks.includes(opt.value) ? 'disabled' : '';
    return `
      <label class="deck-option ${disabled}" style="background:${opt.color}">
        <input type="radio" name="deck" value="${opt.value}" ${disabled} required>
        ${opt.text}
      </label>
    `;
  }).join('');
  addDeckClickListeners();
}

function updateTurnLabel() {
  playerTurn.textContent = `Turno ${currentPlayer + 1}`;
}

startRoll.addEventListener('click', () => startTimer());

function startTimer() {
  let seconds = Math.min(Math.max(Math.ceil(Math.random() * 18), 3), 18);
  timerDisplay.textContent = seconds;
  timerDisplay.style.color = '#007acc';
  const interval = setInterval(() => {
    seconds--;
    timerDisplay.textContent = seconds;
    if (seconds <= 3) timerDisplay.style.color = 'red';
    if (seconds <= 0) {
      clearInterval(interval);
      beep();
      setTimeout(endTurn, 2000); // esperar pitido antes de cambio
    }
  }, 1000);
}

function beep() {
  const audio = new Audio('beep.mp3');
  audio.play();
}

function endTurn() {
  currentPlayer = (currentPlayer + 1) % numPlayers;
  updateTurnLabel();
  gameSection.scrollIntoView({ behavior: 'smooth' });
}
