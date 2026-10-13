/* ── Credit Quest: Knowledge Check (between stages) ─────────────────────────── */

import { gameState } from '../state.js';
import { QUIZ_POINTS, MAX_QUIZ_BONUS } from '../config.js';
import { calculateFICOScore } from '../engine/scoring.js';
import { getQuizBatch } from '../engine/draw.js';
import { emit } from '../events.js';
import { sounds } from '../ui/audio.js';
import { triggerBubble } from '../ui/bubbles.js';
import { el, setContent } from '../ui/dom.js';
import { updateScoreDisplay } from '../ui/hud.js';
import { spawnScoreDeltaFloat } from '../ui/effects.js';
import { beginStage } from './stage.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function showQuizBridge(completedStage) {
  sounds.stageComplete();
  triggerBubble('stage-complete', gameState.character);

  // Level-up banner
  const banner = document.createElement('div');
  banner.id = 'level-up-banner';
  banner.textContent = `🌟 Stage ${completedStage} Complete! 🌟`;
  banner.classList.add('in');
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.classList.replace('in', 'out');
    setTimeout(() => banner.remove(), 420);
  }, 1800);

  // Bridge N follows stage N
  const questions = getQuizBatch(gameState.quizDrawOrder, completedStage);
  showQuizCard(questions, 0, completedStage);
}

function showQuizCard(questions, qIndex, completedStage) {
  if (qIndex >= questions.length) {
    beginStage(completedStage + 1);
    return;
  }

  const q = questions[qIndex];
  const choicesHTML = LETTERS.map(letter => `
    <button class="quiz-choice-btn" data-letter="${letter}">
      <span class="quiz-letter-circle">${letter}</span>
      <span class="quiz-choice-text">${q.choices[letter]}</span>
    </button>
  `).join('');

  setContent(`
    <div class="quiz-wrap">
      <div class="card quiz-card">
        <button id="quiz-next-btn" class="quiz-corner-btn" disabled>
          ${qIndex + 1 < questions.length ? 'Next Question →' : 'Continue →'}
        </button>
        <div class="quiz-kicker">KNOWLEDGE CHECK · ${qIndex + 1} OF ${questions.length}</div>
        <div class="quiz-heading">
          <span class="quiz-heading-icon">🧠</span>
          <h2>Extra Credit Points!</h2>
        </div>
        <p class="quiz-question">${q.question}</p>
        <div id="quiz-choices">${choicesHTML}</div>
        <div id="quiz-result" hidden></div>
      </div>
    </div>
  `);

  el.container.querySelector('#quiz-next-btn').addEventListener('click', () => {
    showQuizCard(questions, qIndex + 1, completedStage);
  });

  el.container.querySelectorAll('.quiz-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuizAnswer(q, btn.dataset.letter));
  });
}

function handleQuizAnswer(q, chosen) {
  const correct = chosen === q.answer;

  if (correct) {
    gameState.quizCorrect++;
    const oldScore = calculateFICOScore(gameState.credit);
    gameState.credit.quizBonus += QUIZ_POINTS;
    if (gameState.credit.hasAnyCredit) {
      updateScoreDisplay(oldScore, calculateFICOScore(gameState.credit));
      spawnScoreDeltaFloat(`+${QUIZ_POINTS}`, '#4ADE80');
    }
    sounds.quizCorrect();
  } else {
    sounds.quizWrong();
  }
  emit('quiz:answer', { questionId: q.id, correct, score: calculateFICOScore(gameState.credit) });

  el.container.querySelectorAll('.quiz-choice-btn').forEach(btn => {
    btn.disabled = true;
    const letter = btn.dataset.letter;
    if (letter === q.answer) btn.classList.add('correct');
    else if (letter === chosen && !correct) btn.classList.add('wrong');
  });

  const resultEl = el.container.querySelector('#quiz-result');
  resultEl.hidden = false;
  resultEl.innerHTML = `
    <div class="quiz-feedback ${correct ? 'correct' : 'wrong'}">
      <div class="quiz-feedback-title">
        ${correct ? `✅ Correct! +${QUIZ_POINTS} Bonus Points` : `❌ The correct answer was ${q.answer}`}
      </div>
      <p>${q.explanation}</p>
    </div>
    ${q.deepDive ? `
    <div class="quiz-deep-dive">
      <button class="explain-more-btn" id="quiz-explain-btn">🔍 Why'd this happen?</button>
      <div class="explain-more-panel" id="quiz-explain-panel">${q.deepDive}</div>
    </div>
    ` : ''}
    <div class="quiz-bonus-tally">
      Bonus Points: <strong>${gameState.credit.quizBonus} / ${MAX_QUIZ_BONUS}</strong>
    </div>
  `;

  el.container.querySelector('#quiz-next-btn').disabled = false;

  const explainBtn = resultEl.querySelector('#quiz-explain-btn');
  explainBtn?.addEventListener('click', () => {
    const open = resultEl.querySelector('#quiz-explain-panel').classList.toggle('open');
    explainBtn.textContent = open ? '🔍 Show Less' : '🔍 Why\'d this happen?';
  });
}
