/* ── Credit Quest: Entry Point ──────────────────────────────────────────────── */
/*                                                                               */
/*  scripts/                                                                     */
/*    main.js        boot: one-time listeners, first screen                      */
/*    game.js        start / reset flow                                          */
/*    state.js       the gameState object                                        */
/*    config.js      tuning numbers (scenarios per stage, quiz points, …)        */
/*    events.js      event bus for add-on features (scoreboard, achievements)    */
/*    data/          content: scenarios, quiz, characters, explanations          */
/*    engine/        pure logic (no DOM): scoring, drawing, run summary          */
/*    ui/            shared UI: header, modal, audio, bubbles, tooltips, effects */
/*    screens/       one module per screen                                       */

import { gameState } from './state.js';
import { loadDictionary } from './ui/tooltip.js';
import { setMuted, isMuted } from './ui/audio.js';
import { initEasterEggs } from './ui/bubbles.js';
import { initBgParticles, initGlobalClickSounds } from './ui/effects.js';
import { initScoreModal } from './ui/modal.js';
import { el } from './ui/dom.js';
import { showCharacterSelect } from './screens/charSelect.js';

function initMuteToggle() {
  el.muteBtn?.addEventListener('click', () => {
    const nowMuted = !isMuted();
    setMuted(nowMuted);
    el.muteBtn.textContent = nowMuted ? '🔇' : '🔊';
    el.muteBtn.title       = nowMuted ? 'Unmute' : 'Mute';
  });
}

async function init() {
  await loadDictionary();

  // Listeners that live for the whole session — attached exactly once
  initMuteToggle();
  initScoreModal();
  initBgParticles();
  initGlobalClickSounds();
  initEasterEggs(gameState);

  showCharacterSelect();
}

init();
