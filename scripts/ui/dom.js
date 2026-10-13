/* ── Credit Quest: DOM refs + content rendering ─────────────────────────────── */

import { gameState } from '../state.js';
import { getDictionary, attachTooltips, trackTerms } from './tooltip.js';

export const el = {
  body:           document.body,
  container:      document.getElementById('stage-container'),
  scoreNumber:    document.getElementById('score-number'),
  scoreTier:      document.getElementById('score-tier'),
  scoreDelta:     document.getElementById('score-delta'),
  scoreTrend:     document.getElementById('score-trend'),
  scoreDisplay:   document.getElementById('score-display'),
  stageIndicator: document.getElementById('stage-indicator'),
  ficoBar:        document.getElementById('fico-bar'),
  charAvatar:     document.getElementById('char-avatar'),
  charName:       document.getElementById('char-name'),
  charAge:        document.getElementById('char-age'),
  playerNameEl:   document.getElementById('player-name-display'),
  muteBtn:        document.getElementById('mute-btn'),
  modalOverlay:   document.getElementById('modal-overlay'),
  scoreModal:     document.getElementById('score-modal'),
};

/* Wire tooltips (and vocabulary tracking) for every .term span in a subtree */
export function enhanceTerms(root, { track = true } = {}) {
  const dict = getDictionary();
  if (!dict) return;
  attachTooltips(root, dict);
  if (track) trackTerms(root, gameState);
}

/* Replace the main stage content */
export function setContent(html) {
  el.container.innerHTML = html;
  enhanceTerms(el.container);
}
