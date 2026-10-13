/* ── Credit Quest: Score Breakdown Modal ────────────────────────────────────── */

import { gameState } from '../state.js';
import {
  calculateFICOScore, getScoreTier, getFactorSubScores,
  FACTOR_META, SCORE_TIERS, factorClass,
} from '../engine/scoring.js';
import { sounds } from './audio.js';
import { el, enhanceTerms } from './dom.js';

const GAUGE_LENGTH = 251.2; // length of the semicircle arc path

function factorRowsHTML(subs) {
  return FACTOR_META.map(m => {
    const pct = subs[m.key] || 0;
    // data-term: paymentHistory → payment-history (dictionary key)
    const term = m.key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `
      <div class="modal-factor-row">
        <div class="modal-factor-head">
          <span class="modal-factor-name">
            ${m.priority ? '🔴' : '⚪'}&nbsp;<span class="term" data-term="${term}">${m.label}</span>
          </span>
          <span class="modal-factor-pct">${m.pct}</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill ${factorClass(pct)}" data-pct="${pct}"></div>
        </div>
      </div>`;
  }).join('');
}

function tierRowsHTML(score) {
  return SCORE_TIERS.map(t => {
    const here = score && score >= t.min && score <= t.max;
    return `
      <div class="modal-tier-row ${here ? 'current' : ''}">
        <span class="modal-tier-label">${t.label}</span>
        <span>${t.min}–${t.max}</span>
        ${here ? '<span>← YOU ARE HERE</span>' : ''}
      </div>`;
  }).join('');
}

export function openScoreModal() {
  sounds.modalOpen();

  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);
  const subs  = getFactorSubScores(gameState.credit);

  el.scoreModal.innerHTML = `
    <button class="modal-x" data-close>✕</button>
    <h2 class="orbitron modal-title">YOUR FICO SCORE</h2>

    <div class="modal-gauge">
      <svg width="200" height="110" viewBox="0 0 200 110">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#374151" stroke-width="14" stroke-linecap="round"/>
        <path id="gauge-arc" d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke="${tier.barColor}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${GAUGE_LENGTH}" stroke-dashoffset="${GAUGE_LENGTH}"/>
      </svg>
      <div class="orbitron modal-score" style="color:${tier.color};">${score || '—'}</div>
      <div class="modal-tier" style="color:${tier.color};">${tier.label}</div>
    </div>

    <div class="modal-section">
      <div class="section-label">THE 5 FACTORS THAT BUILD YOUR SCORE</div>
      ${factorRowsHTML(subs)}
    </div>

    <div class="modal-section">
      <div class="section-label">WHAT YOUR SCORE UNLOCKS</div>
      ${tierRowsHTML(score)}
    </div>

    <div class="modal-footnote">⚡ Building credit takes years. Damaging it takes one missed payment.</div>

    <div class="text-center">
      <button class="choice-btn modal-close-btn" data-close>GOT IT — CLOSE</button>
    </div>
  `;

  el.modalOverlay.style.display = 'flex';
  el.modalOverlay.style.opacity = '0';
  el.scoreModal.style.transform = 'scale(0.85)';
  el.scoreModal.style.opacity   = '0';

  requestAnimationFrame(() => {
    el.modalOverlay.style.transition = 'opacity 200ms ease';
    el.modalOverlay.style.opacity    = '1';
    el.scoreModal.style.transition   = 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease';
    el.scoreModal.style.transform    = 'scale(1)';
    el.scoreModal.style.opacity      = '1';
  });

  // Animate factor bars (staggered) and the gauge arc
  setTimeout(() => {
    el.scoreModal.querySelectorAll('.meter-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = `${bar.dataset.pct}%`; }, i * 100);
    });
    const arcEl = el.scoreModal.querySelector('#gauge-arc');
    if (score && arcEl) {
      arcEl.style.transition = 'stroke-dashoffset 600ms ease-out';
      arcEl.style.strokeDashoffset = `${GAUGE_LENGTH * (1 - (score - 300) / 550)}`;
    }
  }, 300);

  enhanceTerms(el.scoreModal, { track: false });
}

function closeScoreModal() {
  el.modalOverlay.style.opacity = '0';
  el.scoreModal.style.opacity   = '0';
  el.scoreModal.style.transform = 'scale(0.85)';
  setTimeout(() => { el.modalOverlay.style.display = 'none'; }, 220);
}

/* Attach listeners once at startup (the modal's content is re-rendered on open) */
export function initScoreModal() {
  el.scoreDisplay?.addEventListener('click', () => {
    if (gameState.currentStage > 0) openScoreModal();
  });
  el.modalOverlay.addEventListener('click', e => {
    if (e.target === el.modalOverlay || e.target.closest('[data-close]')) closeScoreModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && el.modalOverlay.style.display === 'flex') closeScoreModal();
  });
}
