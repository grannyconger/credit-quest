/* ── Credit Quest: Sound Engine ─────────────────────────────────────────────── */
/* WAV files in sounds/ for new sounds; Web Audio API synth for existing ones.  */

'use strict';

let audioCtx = null;
let _muted   = false;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, dur, type = 'sine', gain = 0.3) {
  if (_muted) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}

/* ── WAV file preloading ──────────────────────────────────────────────────────── */

const WAV_FILES = {
  'onstart':     'sounds/onstart.wav',
  'start':       'sounds/start.wav',
  'intro-mario': 'sounds/intro_mario.wav',
  'intro-luigi': 'sounds/intro_luigi.wav',
  'intro-peach': 'sounds/intro_peach.wav',
  'intro-toad':  'sounds/intro_toad.wav',
  'game-over':   'sounds/game_over.wav',
  'thanks':      'sounds/thanks.wav',
};

const _rawBuffers = {};  // name → ArrayBuffer (fetched, not yet decoded)
const _buffers    = {};  // name → AudioBuffer  (decoded, ready to play)

/* Fetch all WAV files immediately — no AudioContext needed for fetch() */
(async function prefetchSounds() {
  for (const [name, path] of Object.entries(WAV_FILES)) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      _rawBuffers[name] = await res.arrayBuffer();
    } catch(e) { /* file missing or unreachable — skip */ }
  }
})();

/* Decode fetched ArrayBuffers into AudioBuffers — call once AudioContext exists */
async function decodeAllBuffers() {
  const ctx = getCtx();
  for (const [name, raw] of Object.entries(_rawBuffers)) {
    if (_buffers[name]) continue;  // already decoded
    try {
      _buffers[name] = await ctx.decodeAudioData(raw.slice(0)); // slice = clone
    } catch(e) {}
  }
}

/* Play a decoded AudioBuffer. Returns the BufferSourceNode (or null). */
function playBuffer(name, volume = 0.85) {
  if (_muted) return null;
  const buf = _buffers[name];
  if (!buf) return null;
  try {
    const ctx  = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.value = volume;
    src.start();
    return src;  // caller can attach .onended for chaining
  } catch(e) {
    return null;
  }
}

/* ── Sound Library ────────────────────────────────────────────────────────────── */

const sounds = {
  /* ── Existing synthesized sounds — unchanged ── */
  goodChoice:    () => { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15), i * 100)); },
  badChoice:     () => { playTone(220, 0.2, 'sawtooth'); setTimeout(() => playTone(196, 0.3, 'sawtooth'), 150); },
  scoreUp:       () => { [523, 587, 659, 698, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.08), i * 80)); },
  scoreDown:     () => { [784, 698, 659, 587, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 'triangle'), i * 80)); },
  quizCorrect:   () => { playTone(880, 0.1); setTimeout(() => playTone(1047, 0.3), 100); },
  quizWrong:     () => { playTone(200, 0.4, 'square', 0.2); },
  stageComplete: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 130)); },
  stageCompletePerfect: () => {
    [523, 659, 784, 1047, 1319, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 110));
  },
  modalOpen:  () => playTone(440, 0.12, 'sine', 0.15),
  bubblePop:  () => playTone(800, 0.05, 'sine', 0.1),
  easterEgg:  () => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 90)); },
  click:      () => playTone(600, 0.06, 'sine', 0.12),

  /* ── New WAV-backed sounds ── */
  onstart:    () => playBuffer('onstart'),
  start:      () => playBuffer('start'),
  introChar:  (char) => playBuffer(`intro-${char}`),
  gameOver:   () => playBuffer('game-over'),   // returns src node for chaining
  thanks:     () => playBuffer('thanks'),
};

function setMuted(val) { _muted = val; }
function isMuted()     { return _muted; }

/* Call on first user gesture to unlock AudioContext and decode all WAVs */
async function initAudio() {
  try {
    getCtx();
    await decodeAllBuffers();
  } catch(e) {}
}
