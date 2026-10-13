/* ── Credit Quest: Visual Flourishes ────────────────────────────────────────── */

import { gameState } from '../state.js';
import { sounds } from './audio.js';
import { el } from './dom.js';

export function spawnReportStars() {
  const symbols = ['⭐', '✨', '🌟', '💫', '★', '🪙', '🎉', '🏆'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.className = 'report-star';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const left = Math.random() * 98;
    const delay = Math.random() * 1.8;
    const dur   = 2.2 + Math.random() * 2.4;
    const size  = 1 + Math.random() * 1.4;
    el.style.cssText = `left:${left}%;font-size:${size}rem;animation-duration:${dur}s;animation-delay:${delay}s;`;
    frag.appendChild(el);
  }
  const wrap = document.createElement('div');
  wrap.id = 'report-stars-wrap';
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300;overflow:hidden;';
  wrap.appendChild(frag);
  document.body.appendChild(wrap);
  setTimeout(() => { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 5500);
}

/* ── Portrait Firework Effect ────────────────────────────────────────────────── */

function spawnPortraitStars(portraitEl) {
  const rect = portraitEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const stars = ['⭐', '✨', '🌟', '💫'];
  const count = 16;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'portrait-star';
    star.textContent = stars[i % 4];
    const angle = (i / count) * Math.PI * 2;
    const dist = 70 + Math.random() * 90;
    const fx = Math.cos(angle) * dist;
    const fy = Math.sin(angle) * dist;
    const dur = (0.55 + Math.random() * 0.45).toFixed(2);
    const size = (1.1 + Math.random() * 0.8).toFixed(2);
    star.style.cssText = `left:${cx - 12}px;top:${cy - 12}px;font-size:${size}rem;--fx:${fx.toFixed(0)}px;--fy:${fy.toFixed(0)}px;--dur:${dur}s;`;
    document.body.appendChild(star);
    setTimeout(() => { if (star.parentNode) star.parentNode.removeChild(star); }, 1200);
  }
}

export function attachPortraitClickEffect() {
  const portrait = el.container.querySelector('.scenario-char-portrait');
  if (!portrait) return;
  portrait.addEventListener('click', () => {
    sounds.introChar(gameState.character);
    portrait.classList.remove('portrait-spin');
    void portrait.offsetWidth; // force reflow to restart animation
    portrait.classList.add('portrait-spin');
    portrait.addEventListener('animationend', () => portrait.classList.remove('portrait-spin'), { once: true });
    spawnPortraitStars(portrait);
  });
}

export function spawnScoreDeltaFloat(deltaText, color) {
  const scoreEl = document.getElementById('score-number');
  if (!scoreEl) return;
  const rect = scoreEl.getBoundingClientRect();
  const span = document.createElement('span');
  span.className = 'score-delta-float';
  span.textContent = deltaText;
  span.style.cssText = `left:${rect.left + rect.width / 2 - 20}px;top:${rect.top}px;color:${color};`;
  document.body.appendChild(span);
  setTimeout(() => { if (span.parentNode) span.parentNode.removeChild(span); }, 1500);
}

/* ── Background drifting particles ──────────────────────────────────────────── */

export function initBgParticles() {
  if (document.getElementById('bg-particles')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bg-particles';
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'bg-particle';
    const size  = 6 + Math.random() * 18;
    const left  = Math.random() * 100;
    const dur   = 14 + Math.random() * 22;
    const delay = -(Math.random() * dur);
    const dx    = (Math.random() - 0.5) * 120;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${left}%;bottom:0;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      --dx:${dx}px;
    `;
    wrap.appendChild(p);
  }
  document.body.insertBefore(wrap, document.body.firstChild);
}

/* ── Global click-sound delegation ──────────────────────────────────────────── */

export function initGlobalClickSounds() {
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('button, .char-tile, .quiz-choice-btn');
    if (target && !target.disabled) sounds.click();
  }, true); // capture phase so it fires before handlers — screens don't call sounds.click() themselves
}
