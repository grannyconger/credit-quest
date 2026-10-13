/* ── Credit Quest: Intro Cards (story + rules) ──────────────────────────────── */

import { gameState } from '../state.js';
import { CHARACTERS } from '../data/characters.js';
import { escapeHTML } from '../utils.js';
import { triggerBubble } from '../ui/bubbles.js';
import { el, setContent } from '../ui/dom.js';
import { beginStage } from './stage.js';

const INTRO_CARDS = [
  {
    speaker: () => gameState.playerName.toUpperCase(),
    text: `You're 18 and about to graduate. You don't have a credit file yet — one starts the first time a lender reports an account in your name. Your Credit Score — a number from 300 to 850 — will determine your apartment, your loan rates, maybe your job. Right now? You have no score at all.`,
  },
  {
    speaker: () => 'NARRATOR',
    text: `Rule #1: Payment History is 35% of your score. Never miss a payment.<br>Rule #2: Keep your card balance below 30% of your limit.<br>Those two rules control 65% of everything. The quest starts now.`,
  },
];

function storySceneHTML(img, charId) {
  return `
    <div class="rpg-story-scene" id="rpg-scene-story">
      <div class="rpg-story-bg">
        <div class="rpg-story-bg-portrait">
          <img src="${img}" alt="${charId}" onerror="this.style.display='none'">
        </div>
      </div>
      <div class="rpg-story-content">
        <p class="rpg-story-text">The world needs one more hero —<br>not to fight monsters,<br>but to master money.</p>
        <button class="rpg-story-continue" id="rpg-continue">Continue →</button>
      </div>
    </div>
  `;
}

function tipCardHTML(index, img, charId) {
  const card   = INTRO_CARDS[index];
  const total  = INTRO_CARDS.length;
  const isLast = index === total - 1;

  const progDots = Array.from({ length: total }, (_, i) =>
    `<span class="rpg-dot ${i === index ? 'active' : ''}"></span>`
  ).join('');

  return `
    <div class="rpg-scene" id="rpg-scene-${index}">
      <div class="rpg-scene-visual">
        <div class="rpg-char-display">
          <img src="${img}" alt="${charId}" onerror="this.style.display='none'">
        </div>
      </div>
      <div class="rpg-bar">
        <div class="rpg-bar-inner">
          <div class="rpg-portrait">
            <img src="${img}" alt="${charId}" onerror="this.style.display='none'">
          </div>
          <div class="rpg-content">
            <div class="rpg-speaker">${escapeHTML(card.speaker())}</div>
            <p class="rpg-text">${card.text}</p>
            <div class="rpg-meta">Tip ${index + 1} of ${total} &nbsp; ${progDots}</div>
          </div>
          <div class="rpg-bar-actions">
            <button class="rpg-continue-btn" id="rpg-continue">${isLast ? 'Begin Stage 1 →' : 'Continue →'}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* cardIndex: -1 = story framing screen, 0..n-1 = tip cards */
export function showIntro(cardIndex) {
  if (cardIndex >= INTRO_CARDS.length) {
    beginStage(1);
    return;
  }

  const charId = gameState.character;
  const img    = CHARACTERS[charId].img;
  setContent(cardIndex === -1 ? storySceneHTML(img, charId) : tipCardHTML(cardIndex, img, charId));

  el.container.querySelector('#rpg-continue').addEventListener('click', () => showIntro(cardIndex + 1));

  if (cardIndex === 0) {
    setTimeout(() => triggerBubble('no-score-first', gameState.character), 800);
  }
}
