/* ── Credit Quest: Persistent Header (score, factor bars, stage dots) ───────── */

import { gameState } from '../state.js';
import { STAGES } from '../config.js';
import { CHARACTERS } from '../data/characters.js';
import { getScoreTier, describeScoreChange, getFactorSubScores, FACTOR_META, factorClass } from '../engine/scoring.js';
import { capitalize } from '../utils.js';
import { sounds } from './audio.js';
import { triggerBubble, checkDevilScore } from './bubbles.js';
import { el } from './dom.js';

/* ── Score Animation ─────────────────────────────────────────────────────────── */

let _animScore = null; // currently displayed score
let _animFrame = null; // pending requestAnimationFrame id

function animateScoreTo(targetScore, onDone) {
  cancelAnimationFrame(_animFrame); // a newer update supersedes any running animation
  const start = _animScore;
  if (start === targetScore) { if (onDone) onDone(); return; }

  const frames = 40;
  let frame = 0;

  function step() {
    frame++;
    const eased = 1 - Math.pow(1 - frame / frames, 3); // easeOutCubic
    _animScore = start === null ? targetScore : Math.round(start + (targetScore - start) * eased);
    el.scoreNumber.textContent = _animScore;

    if (frame < frames) {
      _animFrame = requestAnimationFrame(step);
    } else {
      _animScore = targetScore;
      el.scoreNumber.textContent = targetScore;
      if (onDone) onDone();
    }
  }
  _animFrame = requestAnimationFrame(step);
}

export function updateScoreDisplay(oldScore, newScore) {
  const tier = getScoreTier(newScore);

  if (newScore === null) {
    cancelAnimationFrame(_animFrame);
    el.scoreNumber.textContent = '—';
    el.scoreNumber.style.color = tier.color;
    el.scoreTier.textContent   = tier.label;
    el.scoreTier.style.color   = tier.color;
    el.scoreDelta.textContent  = '';
    _animScore = null;
    updateFicoBars();
    return;
  }

  if (oldScore === null) _animScore = 300;

  animateScoreTo(newScore, () => {
    if (newScore > (oldScore || 0)) sounds.scoreUp();
    else if (newScore < (oldScore || 0)) sounds.scoreDown();
    checkDevilScore(newScore, gameState.character);
  });

  el.scoreNumber.style.color = tier.color;
  el.scoreTier.textContent   = tier.label;
  el.scoreTier.style.color   = tier.color;

  const change = describeScoreChange(oldScore, newScore);
  el.scoreDelta.textContent = change.label;
  el.scoreDelta.className   = `score-delta ${change.css}`;

  if (el.scoreTrend) {
    el.scoreTrend.textContent = change.css === 'up' ? '▲' : change.css === 'down' ? '▼' : '';
    el.scoreTrend.className   = change.css === 'neutral' ? '' : change.css;
  }

  // Threshold bubble triggers
  if (newScore >= 750 && (oldScore === null || oldScore < 750)) {
    triggerBubble('score-750', gameState.character);
  } else if (newScore < 580 && (oldScore === null || oldScore >= 580)) {
    triggerBubble('score-580', gameState.character);
  }

  updateFicoBars();
}

export function updateFicoBars() {
  if (!el.ficoBar) return;
  const subs = getFactorSubScores(gameState.credit);
  el.ficoBar.querySelectorAll('.fico-segment').forEach((bar, i) => {
    const pct = subs[FACTOR_META[i].key] || 0;
    bar.style.setProperty('--bar-pct', `${pct}%`);
    bar.className = `fico-segment ${factorClass(pct)}`;
  });
}

/* ── Stage Dots + Age ────────────────────────────────────────────────────────── */

export function updateStageDots(stage) {
  el.stageIndicator?.querySelectorAll('.stage-dot').forEach((dot, i) => {
    dot.classList.toggle('active',   i + 1 === stage);
    dot.classList.toggle('complete', i + 1 < stage);
  });
}

export function updateHudAge(stage) {
  if (!el.charAge) return;
  const label = STAGES[stage]?.age;
  el.charAge.textContent   = label || '';
  el.charAge.style.display = label ? 'block' : 'none';
}

/* ── Header identity ─────────────────────────────────────────────────────────── */

export function setHeaderCharacter(name, character) {
  const cd = CHARACTERS[character];
  el.body.className = character;
  el.playerNameEl.textContent = name;
  el.charName.textContent     = capitalize(character);

  const img = document.createElement('img');
  img.src = cd.img;
  img.alt = character;
  img.className = 'avatar-img';
  img.onerror = () => { el.charAvatar.textContent = cd.emoji; };
  el.charAvatar.replaceChildren(img);
}

export function resetHud() {
  el.body.className = '';
  el.playerNameEl.textContent = '';
  el.charName.textContent     = '';
  el.charAvatar.textContent   = '⭐';
  if (el.scoreTrend) { el.scoreTrend.textContent = ''; el.scoreTrend.className = ''; }
  updateScoreDisplay(null, null);
  updateStageDots(0);
  updateHudAge(0);
}
