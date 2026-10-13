/* ── Credit Quest: Stage Flow + Scenario Screens ────────────────────────────── */

import { gameState } from '../state.js';
import { STAGES, STAGE_COUNT, SCENARIOS_PER_STAGE } from '../config.js';
import { CHARACTERS } from '../data/characters.js';
import { stage1Pool, stage2Pool, stage3Pool } from '../data/scenarios.js';
import { generateDeepExplanation } from '../data/explanations.js';
import {
  calculateFICOScore, getScoreTier, applyEffects, applyStageTransition,
  describeScoreChange, getFactorSubScores, FACTOR_META, factorClass,
} from '../engine/scoring.js';
import { drawNextScenario } from '../engine/draw.js';
import { emit } from '../events.js';
import { sounds, initAudio } from '../ui/audio.js';
import { triggerBubble } from '../ui/bubbles.js';
import { el, setContent } from '../ui/dom.js';
import { updateScoreDisplay, updateStageDots, updateHudAge } from '../ui/hud.js';
import { attachPortraitClickEffect } from '../ui/effects.js';
import { showQuizBridge } from './quiz.js';
import { showReportCard } from './report.js';

const STAGE_POOLS = { 1: stage1Pool, 2: stage2Pool, 3: stage3Pool };

/* ── Stage Transition ─────────────────────────────────────────────────────────── */

export function beginStage(stageNum) {
  gameState.currentStage  = stageNum;
  gameState.stageShownIds = [];
  updateStageDots(stageNum);
  updateHudAge(stageNum);

  // Time passes between stages
  if (stageNum > 1) {
    const oldScore = calculateFICOScore(gameState.credit);
    applyStageTransition(gameState.credit);
    updateScoreDisplay(oldScore, calculateFICOScore(gameState.credit));
  }

  emit('stage:begin', { stage: stageNum, score: calculateFICOScore(gameState.credit) });

  if (stageNum === 2 && !gameState.credit.hasAnyCredit) {
    gameState.flags.hadThinFile = true;
    showThinFileWarning(() => showStageIntroCard(2));
    return;
  }

  showStageIntroCard(stageNum);
}

function endStage() {
  const stageNum = gameState.currentStage;
  if (stageNum < STAGE_COUNT) showQuizBridge(stageNum);
  else showReportCard();
}

function showThinFileWarning(onContinue) {
  el.scoreDisplay?.classList.add('thin-file-warning');
  setTimeout(() => el.scoreDisplay?.classList.remove('thin-file-warning'), 4000);

  triggerBubble('thin-file-warning', gameState.character, 5000);

  setContent(`
    <div class="card thin-file-card">
      <div class="thin-file-icon">⚠️</div>
      <h2 class="orbitron thin-file-title">Thin File Warning</h2>
      <p>You're entering college with <strong>no credit history</strong>. This is going to make
      several decisions harder. Lenders see you as an unknown — and unknown is risky to them.</p>
      <p>Stage 2 will give you opportunities to start building. Don't miss them.</p>
      <div class="actions-end">
        <button class="choice-btn" id="thin-file-ok">Got It →</button>
      </div>
    </div>
  `);

  el.container.querySelector('#thin-file-ok').addEventListener('click', onContinue);
}

function showStageIntroCard(stageNum) {
  if (stageNum >= 2) {
    initAudio().then(() => sounds.introChar(gameState.character));
  }

  const info  = STAGES[stageNum];
  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);

  setContent(`
    <div class="stage-hero">
      <div class="stage-hero-bg" style="background-image:url('./images/stage${stageNum}.jpg');"></div>
      <div class="stage-hero-overlay"></div>
      <div class="stage-hero-content">
        <div class="stage-hero-label">Stage ${stageNum} of ${STAGE_COUNT}</div>
        <h2 class="stage-hero-title">${info.title}</h2>
        <div class="stage-hero-age">${info.age}</div>
        <div class="stage-hero-tagline">"${info.tagline}"</div>
        ${score ? `<div class="stage-hero-score">
          Entering at <strong style="color:${tier.color}">${score} — ${tier.label}</strong>
        </div>` : ''}
        <button class="stage-start-btn" id="stage-go-btn">Start Stage →</button>
      </div>
    </div>
  `);

  el.container.querySelector('#stage-go-btn').addEventListener('click', showNextScenario);
}

/* ── Scenario Rendering ───────────────────────────────────────────────────────── */

/* Draws scenarios one at a time so choices earlier in a stage
   (e.g. opening a first card) decide which scenarios are eligible next. */
function showNextScenario() {
  if (gameState.stageShownIds.length >= SCENARIOS_PER_STAGE) return endStage();

  const pool     = STAGE_POOLS[gameState.currentStage];
  const scenario = drawNextScenario(pool, gameState.stageShownIds, gameState);
  if (!scenario) return endStage();

  gameState.stageShownIds.push(scenario.id);
  gameState.currentScenario = scenario;

  if (scenario.type === 'consequence-event') renderConsequenceEvent(scenario);
  else renderScenario(scenario);
}

function leftPanelHTML(scenario, bubbleText) {
  const charId = gameState.character;
  return `
    <div class="scenario-left-panel">
      <div class="scenario-char-portrait">
        <img src="${CHARACTERS[charId].img}" alt="${charId}" onerror="this.style.display='none'">
      </div>
      <div class="scenario-stage-label">Stage ${gameState.currentStage}: ${STAGES[gameState.currentStage].title}</div>
      <div class="scenario-progress-label">${gameState.stageShownIds.length} of ${SCENARIOS_PER_STAGE}</div>
      <div class="scenario-setting-badge">${scenario.setting}</div>
      ${bubbleText ? `<div class="card-bubble scenario-bubble">${bubbleText}</div>` : ''}
    </div>
  `;
}

function scenarioShellHTML(scenario, bubbleText, bodyHTML) {
  return `
    <div class="scenario-wrapper scenario-two-col">
      ${leftPanelHTML(scenario, bubbleText)}
      <div class="scenario-right-panel">
        <div class="card" id="scenario-card">
          <h2 class="scenario-title">${scenario.title}</h2>
          <div class="scenario-narrative">${scenario.narrative || ''}</div>
          ${bodyHTML}
        </div>
      </div>
    </div>
  `;
}

function renderScenario(scenario) {
  const choicesHTML = scenario.choices.map((choice, i) => `
    <button class="choice-btn scenario-choice" data-index="${i}">
      <span class="choice-letter">${String.fromCharCode(65 + i)}.</span>
      ${choice.label}
    </button>
  `).join('');

  setContent(scenarioShellHTML(
    scenario,
    scenario.characterBubble?.[gameState.character],
    `<div class="scenario-takeaway">⚡ ${scenario.takeaway || scenario.decision || ''}</div>
     <div id="choices-area">${choicesHTML}</div>`
  ));

  attachPortraitClickEffect();

  const buttons = el.container.querySelectorAll('.scenario-choice');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      buttons.forEach(b => { b.disabled = true; });
      btn.classList.add('choice-pulse-good');
      setTimeout(() => recordChoice(scenario, parseInt(btn.dataset.index, 10)), 300);
    });
  });
}

/* ── Consequence Event (no choices — score determines outcome) ───────────────── */

const EVENT_REVEAL = {
  's3-01': { cls: 'apartment', callout: '📊 Your credit score is being evaluated right now.', button: '🏠 Reveal My Result →' },
  's3-02': { cls: 'car',       callout: '🚗 Your credit score determines your interest rate right now.', button: '🚗 Reveal My Rate →' },
  's3-03': { cls: 'job',       callout: '📋 Your credit history is being reviewed for the background check.', button: '🏢 Reveal My Result →' },
};

function renderConsequenceEvent(scenario) {
  const score = calculateFICOScore(gameState.credit);

  // Highest threshold the score clears; no score falls through to the worst outcome
  const sorted  = [...scenario.outcomesByScore].sort((a, b) => b.minScore - a.minScore);
  const outcome = sorted.find(o => score !== null && score >= o.minScore) || sorted[sorted.length - 1];

  if (outcome.flagKey) gameState.flags[outcome.flagKey] = outcome.flagValue;

  const reveal = EVENT_REVEAL[scenario.id];
  const revealHTML = reveal
    ? `<div class="${reveal.cls}-result-callout">${reveal.callout}</div>
       <button class="${reveal.cls}-result-btn" id="event-next-btn">${reveal.button}</button>`
    : `<div class="actions-end"><button class="choice-btn" id="event-next-btn">See My Result →</button></div>`;

  setContent(scenarioShellHTML(scenario, null, revealHTML));
  attachPortraitClickEffect();

  el.container.querySelector('#event-next-btn').addEventListener('click', () => {
    // Outcomes use short field names; map them onto the choice shape
    showConsequenceResult({
      consequenceTitle:  outcome.title,
      consequenceEmoji:  outcome.emoji,
      consequenceText:   outcome.text,
      consequenceBubble: outcome.consequenceBubble,
      factorHighlight:   outcome.factorHighlight,
    }, null);
  });
}

/* ── Record Player Choice ─────────────────────────────────────────────────────── */

function recordChoice(scenario, choiceIndex) {
  const choice   = scenario.choices[choiceIndex];
  const oldScore = calculateFICOScore(gameState.credit);

  applyEffects(choice.effects, gameState.credit, gameState.flags);

  const newScore    = calculateFICOScore(gameState.credit);
  const scoreEffect = (newScore !== null && oldScore !== null) ? newScore - oldScore : null;

  gameState.decisionsLog.push({
    scenarioId:    scenario.id,
    scenarioTitle: scenario.title,
    stage:         gameState.currentStage,
    choiceIndex,
    choiceLabel:   choice.label,
    oldScore,
    newScore,
    scoreEffect,
  });
  emit('choice', { scenarioId: scenario.id, choiceIndex, oldScore, newScore });

  const delta = (newScore || 0) - (oldScore || 0);
  if (delta > 0)      sounds.goodChoice();
  else if (delta < 0) sounds.badChoice();
  else                sounds.bubblePop();

  if (choice.effects?.newCredit?.hardInquiries >= 2) {
    triggerBubble('multiple-inquiries', gameState.character);
  }
  if (choice.bubble) {
    setTimeout(() => triggerBubble(choice.bubble, gameState.character), 1500);
  }

  showConsequenceResult(choice, { oldScore, newScore });
}

/* ── Consequence Card ─────────────────────────────────────────────────────────── */

function statBarsHTML(factorKeys) {
  const subs = getFactorSubScores(gameState.credit);
  return (factorKeys || []).map(key => {
    const meta = FACTOR_META.find(m => m.key === key);
    if (!meta) return '';
    const pct = subs[meta.key] || 0;
    return `<div class="stat-bar-row">
      <span class="stat-bar-label">${meta.label}</span>
      <div class="stat-bar-track"><div class="stat-bar-fill ${factorClass(pct)}" data-pct="${pct}"></div></div>
      <span class="stat-bar-pct">${meta.pct}</span>
    </div>`;
  }).join('');
}

function showConsequenceResult(choice, scoreData) {
  if (scoreData) updateScoreDisplay(scoreData.oldScore, scoreData.newScore);

  const change    = scoreData ? describeScoreChange(scoreData.oldScore, scoreData.newScore) : null;
  const tier      = scoreData ? getScoreTier(scoreData.newScore) : null;
  const bubble    = choice.consequenceBubble?.[gameState.character];
  const statBars  = statBarsHTML(choice.factorHighlight);

  const card = document.createElement('div');
  card.className = 'consequence-card card-dark';
  card.innerHTML = `
    <div class="conseq-head">
      <span class="conseq-emoji">${choice.consequenceEmoji || '📋'}</span>
      <h3 class="conseq-title">${choice.consequenceTitle || 'What Happened'}</h3>
    </div>
    <p class="conseq-text">${choice.consequenceText || ''}</p>
    ${scoreData ? `
    <div class="conseq-score-big">
      <span class="conseq-score-num" style="color:${tier.color};">${scoreData.newScore || '—'}</span>
      <span class="conseq-score-change ${change.css}">${change.label}</span>
    </div>
    <div class="conseq-tier">${tier.label}</div>
    ` : ''}
    ${statBars ? `<div class="stat-bar-section">${statBars}</div>` : ''}
    ${bubble ? `<div class="card-bubble conseq-bubble">${bubble}</div>` : ''}
    <div class="conseq-actions">
      ${scoreData ? '<button class="explain-more-btn" id="explain-btn">🔍 Why\'d this happen?</button>' : '<span></span>'}
      <button class="choice-btn" id="next-btn">Continue →</button>
    </div>
    ${scoreData ? '<div class="explain-more-panel" id="explain-panel"></div>' : ''}
  `;

  // Swap the right panel in place (keeps the viewport, no scroll jump)
  const rightPanel = el.container.querySelector('.scenario-right-panel') || el.container;
  rightPanel.replaceChildren(card);

  // Animate stat bars in
  setTimeout(() => {
    card.querySelectorAll('.stat-bar-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = `${bar.dataset.pct}%`; }, i * 120);
    });
  }, 250);

  // "Why'd this happen?" toggle — built lazily on first open
  const explainBtn   = card.querySelector('#explain-btn');
  const explainPanel = card.querySelector('#explain-panel');
  explainBtn?.addEventListener('click', () => {
    const open = explainPanel.classList.toggle('open');
    explainBtn.textContent = open ? '🔍 Show Less' : '🔍 Why\'d this happen?';
    if (open && !explainPanel.innerHTML) explainPanel.innerHTML = generateDeepExplanation(choice);
  });

  card.querySelector('#next-btn').addEventListener('click', showNextScenario);
}
