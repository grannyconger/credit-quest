/* ── Credit Quest: Game Flow (start / reset) ────────────────────────────────── */

import { gameState, resetGameState } from './state.js';
import { initQuizDrawOrder } from './engine/draw.js';
import { emit } from './events.js';
import { triggerBubble } from './ui/bubbles.js';
import { el } from './ui/dom.js';
import { setHeaderCharacter, updateScoreDisplay, updateHudAge, resetHud } from './ui/hud.js';
import { showCharacterSelect } from './screens/charSelect.js';
import { showIntro } from './screens/intro.js';

export function startGame(name, character) {
  gameState.playerName    = name;
  gameState.character     = character;
  gameState.quizDrawOrder = initQuizDrawOrder();

  setHeaderCharacter(name, character);
  updateScoreDisplay(null, null);
  updateHudAge(0);

  triggerBubble('game-start', character);
  emit('game:start', { playerName: name, character });

  showIntro(-1); // -1 = story framing screen
}

export function resetGame() {
  resetGameState();
  el.container.classList.remove('scrollable');
  resetHud();
  showCharacterSelect();
}
