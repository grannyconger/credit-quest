/* ── Credit Quest: Web Audio API Sound Engine ───────────────────────────────── */

'use strict';

let audioCtx = null;
let _muted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, dur, type = 'sine', gain = 0.3) {
  if (_muted) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    // AudioContext errors are non-fatal
  }
}

const sounds = {
  goodChoice:    () => { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15), i * 100)); },
  badChoice:     () => { playTone(220, 0.2, 'sawtooth'); setTimeout(() => playTone(196, 0.3, 'sawtooth'), 150); },
  scoreUp:       () => { [523, 587, 659, 698, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.08), i * 80)); },
  scoreDown:     () => { [784, 698, 659, 587, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 'triangle'), i * 80)); },
  quizCorrect:   () => { playTone(880, 0.1); setTimeout(() => playTone(1047, 0.3), 100); },
  quizWrong:     () => { playTone(200, 0.4, 'square', 0.2); },
  stageComplete: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 130)); },
  stageCompletePerfect: () => {
    // Extended fanfare for perfect payment history
    [523, 659, 784, 1047, 1319, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 110));
  },
  modalOpen:     () => playTone(440, 0.12, 'sine', 0.15),
  bubblePop:     () => playTone(800, 0.05, 'sine', 0.1),
  easterEgg:     () => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 90)); },
  click:         () => playTone(600, 0.06, 'sine', 0.12),
};

function setMuted(val) {
  _muted = val;
}

function isMuted() {
  return _muted;
}

/* Call this on first user gesture to unlock AudioContext */
function initAudio() {
  try {
    getCtx();
  } catch (e) {
    // silently ignore if Web Audio unavailable
  }
}
