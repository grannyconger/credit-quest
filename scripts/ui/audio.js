/* ── Credit Quest: Sound Engine ─────────────────────────────────────────────── */
/* WAV files in sounds/ for new sounds; Web Audio API synth for existing ones.  */


let audioCtx = null;
let _muted   = false;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/* Tracks the earliest time (ms) each synth-sound key may play again */
const _synthCooldowns = {};

/* Returns true and records cooldown if the sound is allowed to play now */
function _synthAllowed(key, durationMs) {
  const now = Date.now();
  if (_synthCooldowns[key] && now < _synthCooldowns[key]) return false;
  _synthCooldowns[key] = now + durationMs;
  return true;
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

const _rawBuffers  = {};  // name → ArrayBuffer (fetched, not yet decoded)
const _buffers     = {};  // name → AudioBuffer  (decoded, ready to play)
const _activeSrcs  = {};  // name → BufferSourceNode currently playing (or null)

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

/* Play a decoded AudioBuffer. Returns the BufferSourceNode (or null).
   If the same sound is already playing it is ignored (no stacking). */
function playBuffer(name, volume = 0.85) {
  if (_muted) return null;
  if (_activeSrcs[name]) return null;  // already playing — ignore
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
    _activeSrcs[name] = src;
    src.onended = () => { _activeSrcs[name] = null; };
    src.start();
    return src;  // caller can attach .onended for chaining
  } catch(e) {
    return null;
  }
}

/* ── Sound Library ────────────────────────────────────────────────────────────── */

export const sounds = {
  /* ── Existing synthesized sounds — unchanged ── */
  goodChoice:    () => { if (!_synthAllowed('goodChoice', 400)) return; [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15), i * 100)); },
  badChoice:     () => { if (!_synthAllowed('badChoice', 500)) return; playTone(220, 0.2, 'sawtooth'); setTimeout(() => playTone(196, 0.3, 'sawtooth'), 150); },
  scoreUp:       () => { if (!_synthAllowed('scoreUp', 500)) return; [523, 587, 659, 698, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.08), i * 80)); },
  scoreDown:     () => { if (!_synthAllowed('scoreDown', 500)) return; [784, 698, 659, 587, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.08, 'triangle'), i * 80)); },
  quizCorrect:   () => { if (!_synthAllowed('quizCorrect', 500)) return; playTone(880, 0.1); setTimeout(() => playTone(1047, 0.3), 100); },
  quizWrong:     () => { if (!_synthAllowed('quizWrong', 500)) return; playTone(200, 0.4, 'square', 0.2); },
  stageComplete: () => { if (!_synthAllowed('stageComplete', 800)) return; [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 130)); },
  stageCompletePerfect: () => {
    if (!_synthAllowed('stageCompletePerfect', 1100)) return;
    [523, 659, 784, 1047, 1319, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 110));
  },
  modalOpen:  () => { if (!_synthAllowed('modalOpen', 200)) return; playTone(440, 0.12, 'sine', 0.15); },
  bubblePop:  () => { if (!_synthAllowed('bubblePop', 100)) return; playTone(800, 0.05, 'sine', 0.1); },
  easterEgg:  () => { if (!_synthAllowed('easterEgg', 700)) return; [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1), i * 90)); },
  click:      () => { if (!_synthAllowed('click', 150)) return; playTone(600, 0.06, 'sine', 0.12); },

  /* ── New WAV-backed sounds ── */
  onstart:    () => playBuffer('onstart'),
  start:      () => playBuffer('start'),
  introChar:  (char) => playBuffer(`intro-${char}`),
  gameOver:   () => playBuffer('game-over'),   // returns src node for chaining
  thanks:     () => playBuffer('thanks'),
};

export function setMuted(val) { _muted = val; }
export function isMuted()     { return _muted; }

/* Call on first user gesture to unlock AudioContext and decode all WAVs */
export async function initAudio() {
  try {
    getCtx();
    await decodeAllBuffers();
  } catch(e) {}
}
