/* ── Credit Quest: Final Report Card ────────────────────────────────────────── */

import { gameState } from '../state.js';
import { STAGES, MAX_QUIZ_BONUS } from '../config.js';
import { calculateFICOScore, getScoreTier, getFactorSubScores, FACTOR_META, factorClass } from '../engine/scoring.js';
import { buildRunSummary } from '../engine/summary.js';
import { escapeHTML } from '../utils.js';
import { emit } from '../events.js';
import { sounds } from '../ui/audio.js';
import { bubbles } from '../ui/bubbles.js';
import { getDictionary } from '../ui/tooltip.js';
import { el, setContent, enhanceTerms } from '../ui/dom.js';
import { updateStageDots } from '../ui/hud.js';
import { spawnReportStars } from '../ui/effects.js';
import { resetGame } from '../game.js';

const FACTOR_PLAIN = {
  paymentHistory: { icon: '💳', plain: 'Do you pay your bills on time? Late payments hurt — a lot. This is the biggest factor.' },
  amountsOwed:    { icon: '📊', plain: 'How much of your available credit are you using? Keep your card balances below 30% of your limit.' },
  lengthHistory:  { icon: '📅', plain: 'How long have you had credit? Older accounts help. Don\'t close your oldest card.' },
  creditMix:      { icon: '🔄', plain: 'Do you have both credit cards and loans? A healthy mix of types shows you can manage different debt.' },
  newCredit:      { icon: '🔍', plain: 'Have you applied for a lot of new credit recently? Each application leaves a hard inquiry on your report.' },
};

function factorBarsHTML(subs) {
  return FACTOR_META.map(m => {
    const pct = subs[m.key] || 0;
    return `
      <div class="report-factor">
        <div class="report-factor-head">
          <span class="report-factor-name">${m.label}</span>
          <span class="report-factor-value">${m.pct} · ${pct}/100</span>
        </div>
        <div class="meter-track tall">
          <div class="meter-fill ${factorClass(pct)}" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');
}

function factorExplainersHTML() {
  return FACTOR_META.map(m => `
    <div class="report-explainer">
      <span class="report-explainer-icon">${FACTOR_PLAIN[m.key].icon}</span>
      <div>
        <div class="report-explainer-name">${m.label} <span class="report-explainer-pct">(${m.pct})</span></div>
        <div class="report-explainer-text">${FACTOR_PLAIN[m.key].plain}</div>
      </div>
    </div>
  `).join('');
}

function journeyHTML() {
  const byStage = {};
  for (const d of gameState.decisionsLog) (byStage[d.stage] ||= []).push(d);

  const html = Object.keys(byStage).sort().map(stage => {
    const items = byStage[stage].map(d => {
      const effCls = d.scoreEffect > 0 ? 'up' : d.scoreEffect < 0 ? 'down' : '';
      const eff = d.scoreEffect !== null
        ? `<span class="journey-effect ${effCls}"> ${d.scoreEffect > 0 ? '+' : ''}${d.scoreEffect} pts</span>`
        : '';
      return `<li>
        <span class="journey-title">${d.scenarioTitle}</span>
        <span class="journey-choice"> — ${d.choiceLabel}</span>${eff}
      </li>`;
    }).join('');
    const info = STAGES[stage];
    return `
      <div class="journey-stage">
        <div class="journey-stage-label">${info ? `${info.title} (${info.age})` : `Stage ${stage}`}</div>
        <ul class="journey-list">${items}</ul>
      </div>`;
  }).join('');

  return html || '<p class="muted">No decisions recorded.</p>';
}

export function showReportCard() {
  const gameOverSrc = sounds.gameOver();
  if (gameOverSrc) gameOverSrc.onended = () => sounds.thanks();
  else sounds.stageComplete();

  gameState.currentStage = 4;
  el.container.classList.add('scrollable');
  updateStageDots(4);

  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);
  const flags = gameState.flags;

  const closingBubble = (score && score >= 740)
    ? bubbles.reportPerfect[gameState.character]
    : bubbles.reportPoor[gameState.character];

  if (flags.perfectPaymentHistory) sounds.stageCompletePerfect();

  const termCount = gameState.termsEncountered.size;

  setContent(`
    <div class="report">

      <div class="card report-header">
        <div class="orbitron report-kicker">FINAL REPORT CARD</div>
        <h1 class="orbitron report-title">${escapeHTML(gameState.playerName)}'s Credit Journey</h1>
        ${flags.perfectPaymentHistory ? '<div class="achievement-badge">🏆 FLAWLESS PAYMENT HISTORY</div>' : ''}

        <div class="report-score-block">
          <div class="orbitron report-score" id="report-score" style="color:${tier.color};">${score || '—'}</div>
          <div class="report-tier" style="color:${tier.color};">${tier.label}</div>
        </div>

        <div class="card-bubble">${closingBubble}</div>

        <div class="report-stats">
          <div><span>Quiz Bonus</span><br><strong>${gameState.credit.quizBonus} / ${MAX_QUIZ_BONUS} pts</strong></div>
          <div><span>Decisions Made</span><br><strong>${gameState.decisionsLog.length}</strong></div>
          <div><span>Terms Learned</span><br><strong>${termCount}</strong></div>
        </div>
      </div>

      <div class="card report-section" id="vocab-section">
        <div class="section-label">VOCABULARY YOU ENCOUNTERED</div>
        <button class="choice-btn vocab-toggle" id="vocab-toggle-btn">SHOW TERMS (${termCount})</button>
        <div id="vocab-list" hidden></div>
      </div>

      <div class="card report-section">
        <div class="section-label">THE 5 FACTORS THAT BUILD YOUR SCORE</div>
        ${factorExplainersHTML()}
      </div>

      <div class="card report-section">
        <div class="section-label">YOUR FICO FACTOR BREAKDOWN</div>
        ${factorBarsHTML(getFactorSubScores(gameState.credit))}
      </div>

      <div class="card report-section">
        <div class="section-label">YOUR JOURNEY</div>
        ${journeyHTML()}
      </div>

      <div class="report-play-again">
        <button class="choice-btn" id="play-again-btn">PLAY AGAIN ↺</button>
      </div>

    </div>
  `);

  el.container.scrollTop = 0;
  spawnReportStars();

  // Stagger the report card sections
  el.container.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
  });

  // Vocab toggle — list is built on first open
  const vocabBtn  = el.container.querySelector('#vocab-toggle-btn');
  const vocabList = el.container.querySelector('#vocab-list');
  vocabBtn.addEventListener('click', () => {
    if (vocabList.hidden) {
      const dict = getDictionary() || {};
      const entries = [...gameState.termsEncountered].map(key => {
        const entry = dict[key];
        if (!entry) return '';
        return `<div class="vocab-entry">
          <strong>${entry.term_en}</strong>
          <p>${entry.definition_en || ''}</p>
        </div>`;
      }).join('');
      vocabList.innerHTML = entries || '<p class="muted">No terms tracked.</p>';
      vocabList.hidden = false;
      vocabBtn.textContent = 'HIDE TERMS';
      enhanceTerms(vocabList, { track: false });
    } else {
      vocabList.hidden = true;
      vocabBtn.textContent = `SHOW TERMS (${termCount})`;
    }
  });

  el.container.querySelector('#play-again-btn').addEventListener('click', resetGame);

  emit('game:end', { summary: buildRunSummary(gameState) });
}
