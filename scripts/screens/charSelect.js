/* ── Credit Quest: Character Select (screen 0) ──────────────────────────────── */

import { gameState } from '../state.js';
import { CHARACTERS } from '../data/characters.js';
import { capitalize } from '../utils.js';
import { sounds, initAudio } from '../ui/audio.js';
import { el, setContent } from '../ui/dom.js';
import { updateStageDots, updateHudAge } from '../ui/hud.js';
import { startGame } from '../game.js';

/* The intro jingle plays on the first interaction of the session */
let _onstartPlayed = false;
async function playOnstartOnce() {
  if (_onstartPlayed) return;
  _onstartPlayed = true;
  document.removeEventListener('click',   playOnstartOnce);
  document.removeEventListener('keydown', playOnstartOnce);
  await initAudio();
  sounds.onstart();
}

export function showCharacterSelect() {
  gameState.currentStage = 0;
  updateStageDots(0);
  updateHudAge(0);

  // Title splash overlay
  const splash = document.createElement('div');
  splash.id = 'title-splash';
  splash.innerHTML = `<span class="title-splash-word boogaloo">Credit Quest</span>`;
  document.body.appendChild(splash);

  const tiles = Object.entries(CHARACTERS).map(([id, data]) => `
    <button class="char-tile" data-char="${id}" style="--cc-primary:${data.primary}">
      <div class="char-tile-img-wrap">
        <img src="${data.img}" alt="${id}" data-fallback="${data.emoji}">
      </div>
      <div class="char-tile-name">${capitalize(id)}</div>
      <div class="char-tile-blurb">${data.blurb}</div>
    </button>
  `).join('');

  setContent(`
    <div class="char-select-panel" style="opacity:0;">
      <div class="char-select-header">
        <h1 class="boogaloo credit-quest-title">Credit Quest</h1>
        <p class="char-select-tagline">Your credit score shapes your future. Build it wisely.</p>
        <div class="char-name-row">
          <label for="name-input">Your Name</label>
          <input id="name-input" type="text" placeholder="Enter your name…" maxlength="24" autocomplete="off">
        </div>
      </div>
      <div class="char-select-label">Choose Your Character</div>
      <div class="char-grid-full">${tiles}</div>
      <button id="start-btn" class="start-quest-btn" disabled>
        Start Quest →
      </button>
    </div>
  `);

  // Emoji fallback if a portrait fails to load
  el.container.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.parentNode.textContent = img.dataset.fallback; }, { once: true });
  });

  const panel = el.container.querySelector('.char-select-panel');
  setTimeout(() => {
    splash.remove();
    panel.style.opacity = '1';
    panel.style.transition = 'opacity 400ms ease';
  }, 2000);

  document.addEventListener('click',   playOnstartOnce);
  document.addEventListener('keydown', playOnstartOnce);

  let selectedChar = '';
  const nameInput = el.container.querySelector('#name-input');
  const startBtn  = el.container.querySelector('#start-btn');

  function checkReady() {
    const ready = nameInput.value.trim().length > 0 && selectedChar !== '';
    startBtn.disabled = !ready;
    startBtn.classList.toggle('btn-ready', ready);
  }

  el.container.querySelectorAll('.char-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      el.container.querySelectorAll('.char-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      selectedChar = tile.dataset.char;
      initAudio().then(() => sounds.introChar(selectedChar));
      checkReady();
    });
  });

  let _startPlayed = false;
  nameInput.addEventListener('focus', async () => {
    if (_startPlayed) return;
    _startPlayed = true;
    await initAudio();
    sounds.start();
  });
  nameInput.addEventListener('input', checkReady);

  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name || !selectedChar) return;
    startGame(name, selectedChar);
  });
}
