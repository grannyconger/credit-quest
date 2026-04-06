/* ── Credit Quest: Character Bubble System + Easter Eggs ────────────────────── */

'use strict';

/* ── All Character Quip Sets ─────────────────────────────────────────────────── */

const bubbles = {
  intro: {
    mario: "Let's-a go! Time to build something great — starting with your credit score!",
    luigi: "A fresh start! I've read every credit article on the internet. You're welcome.",
    peach: "The real treasure was the credit score we built along the way.",
    toad:  "Okay, listen. I've made every mistake in this game. Learn from me. DON'T be me."
  },
  noScore: {
    mario: "No score?! That's-a like starting at World 1-1. Time to collect some coins!",
    luigi: "Zero. Just like my confidence when Mario gets all the credit. Let's fix that.",
    peach: "No credit history? Not for long. Watch me build this score brick by brick.",
    toad:  "No score? No problem. No... actually wait, it IS a problem. Let's go."
  },
  paymentHistory: {
    mario: "Pay on time, every time. That's Rule #1. Even more important than jumping on Goombas.",
    luigi: "I set up autopay for everything. I have enough anxiety already.",
    peach: "Missing a payment is like leaving the castle gate open. Don't do it.",
    toad:  "My memory is terrible. Autopay literally saved my financial life."
  },
  tooManyCards: {
    mario: "Wahoo... that's-a too many mushrooms, my friend.",
    luigi: "Oh no. OH NO. That's too many hard inquiries. I'm going to be sick.",
    peach: "Three credit cards? Even I don't have three credit cards. One. Responsibly.",
    toad:  "Okay but hear me out — what if you... no. No. I almost made a terrible suggestion."
  },
  highScore: {
    mario: "Incredible! You're-a in the castle! The credit castle!",
    luigi: "I... I'm not crying. It's just — your Payment History is so beautiful.",
    peach: "Exceptional. As expected. Now go refinance something.",
    toad:  "HOLY MUSHROOM. WE DID IT. Well, YOU did it. I just watched."
  },
  lowScore: {
    mario: "Mamma mia... it's-a like falling in a pit. Climb back out!",
    luigi: "This is fine. Everything is fine. *quietly rocks back and forth*",
    peach: "Okay. Deep breath. We've seen worse. (We haven't seen worse.) We'll fix this.",
    toad:  "I've seen this before. My cousin. Jet ski. It's fine. Make a plan."
  },
  collections: {
    mario: "You can't just-a jump OVER debt. It follows you!",
    luigi: "Mamma mia, the collectors are coming! Run! No wait — call them!",
    peach: "Ignoring it doesn't make it disappear. Trust me. I tried that with Bowser.",
    toad:  "Ah yes, the ostrich strategy. Very popular. Zero stars."
  },
  creditRepairScam: {
    mario: "You got-a bamboozled! Those guys are crooks!",
    luigi: "I researched them first. They have ONE star. ONE.",
    peach: "I feel like I should have warned you. Consider this that warning.",
    toad:  "My cousin paid them $800. His score went DOWN. Small world."
  },
  thinFile: {
    mario: "You have no credit history. Zero. This Stage 2 is going to be... spicy.",
    luigi: "A thin file. This is... not ideal. I have a spreadsheet of recovery strategies.",
    peach: "No credit history going into college? Bold choice. Let's make it work.",
    toad:  "Thin file gang. We don't recommend it. Fix it ASAP."
  },
  stageComplete: {
    mario: "Stage complete! Wahoo! On to the next one!",
    luigi: "We made it through! I was worried. I'm always worried. But we made it!",
    peach: "Another stage conquered. Gracefully, as always.",
    toad:  "STAGE DONE. Let's GO. Actually wait, was that a good idea back there? ...Moving on."
  },
  reportPerfect: {
    mario: "You saved the princess AND your credit score! Hero!",
    luigi: "I've always believed in you. (I was nervous the whole time.)",
    peach: "Immaculate. Frame this report card.",
    toad:  "Nobody expected this. Especially not me. Especially not you. CONGRATS."
  },
  reportPoor: {
    mario: "Hey! Every hero falls down sometimes. Rebuild, retry, recover!",
    luigi: "It's okay. It took me three playthroughs to figure it out too.",
    peach: "A setback, not a defeat. You know what to do differently now.",
    toad:  "Okay so... that happened. The good news is you can do it again. The bad news is... you have to do it again."
  },
  konamiCode: {
    mario: "You found the cheat code. Unfortunately credit scores don't have cheat codes. Nice try though.",
    luigi: "You found the cheat code. Unfortunately credit scores don't have cheat codes. Nice try though.",
    peach: "You found the cheat code. Unfortunately credit scores don't have cheat codes. Nice try though.",
    toad:  "You found the cheat code. Unfortunately credit scores don't have cheat codes. Nice try though."
  },
  avatarSpin: {
    mario: "Woo-hoo! You found my spin jump!",
    luigi: "...Are you done? Can we get back to the credit simulation?",
    peach: "That's actually kind of fun. But focus, please.",
    toad:  "SPIN. Do it again. AGAIN."
  },
  mustChoose: {
    mario: "You have to actually decide. That's... kind of the whole game.",
    luigi: "You have to actually decide. That's... kind of the whole game.",
    peach: "You have to actually decide. That's... kind of the whole game.",
    toad:  "You have to actually decide. That's... kind of the whole game."
  },
  scoreFact: {
    mario: "The nerds who built FICO were probably also into arcades. Full circle.",
    luigi: "The nerds who built FICO were probably also into arcades. Full circle.",
    peach: "The nerds who built FICO were probably also into arcades. Full circle.",
    toad:  "The nerds who built FICO were probably also into arcades. Full circle."
  }
};

/* ── Show / Hide Bubble ───────────────────────────────────────────────────────── */

let _currentBubble = null;
let _bubbleTimer   = null;

function showBubble(text, duration = 4000) {
  const avatarEl = document.getElementById('char-avatar');
  if (!avatarEl) return;

  // Remove existing bubble
  if (_currentBubble) {
    _currentBubble.remove();
    _currentBubble = null;
  }
  clearTimeout(_bubbleTimer);

  if (!text) return;

  const bubble = document.createElement('div');
  bubble.className = 'character-bubble';
  bubble.textContent = text;
  avatarEl.appendChild(bubble);
  _currentBubble = bubble;

  if (typeof sounds !== 'undefined') sounds.bubblePop();

  _bubbleTimer = setTimeout(() => {
    if (_currentBubble === bubble) {
      bubble.style.animation = 'bubbleOut 200ms ease-in forwards';
      setTimeout(() => {
        bubble.remove();
        if (_currentBubble === bubble) _currentBubble = null;
      }, 200);
    }
  }, duration);
}

function showBubbleForChar(quipSet, character, duration = 4000) {
  const text = quipSet[character] || quipSet.toad;
  showBubble(text, duration);
}

/* ── Trigger by Named Event ──────────────────────────────────────────────────── */

const bubbleTriggers = {
  'game-start':          bubbles.intro,
  'no-score-first':      bubbles.noScore,
  'payment-history-explain': bubbles.paymentHistory,
  'multiple-inquiries':  bubbles.tooManyCards,
  'score-750':           bubbles.highScore,
  'score-580':           bubbles.lowScore,
  'ignore-collections':  bubbles.collections,
  'consequence-S3-09-B': bubbles.creditRepairScam,
  'thin-file-warning':   bubbles.thinFile,
  'stage-complete':      bubbles.stageComplete,
  'report-perfect':      bubbles.reportPerfect,
  'report-poor':         bubbles.reportPoor,
  'konami-code':         bubbles.konamiCode,
  'avatar-spin':         bubbles.avatarSpin,
  'must-choose':         bubbles.mustChoose,
  'score-fact':          bubbles.scoreFact,
};

function triggerBubble(eventKey, character, duration = 4000) {
  const quipSet = bubbleTriggers[eventKey];
  if (!quipSet) return;
  showBubbleForChar(quipSet, character, duration);
}

/* ── Easter Egg: Konami Code ─────────────────────────────────────────────────── */

const _konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let _konamiPos = 0;

function _handleKonami(e, character, gameState) {
  if (e.key === _konamiSeq[_konamiPos]) {
    _konamiPos++;
    if (_konamiPos === _konamiSeq.length) {
      _konamiPos = 0;
      _fireKonamiEasterEgg(character, gameState);
    }
  } else {
    _konamiPos = (e.key === _konamiSeq[0]) ? 1 : 0;
  }
}

function _fireKonamiEasterEgg(character, gameState) {
  gameState.flags.foundEasterEgg = true;
  const scoreEl = document.getElementById('score-number');
  if (scoreEl) {
    const orig = scoreEl.textContent;
    scoreEl.textContent = '????';
    scoreEl.closest('#score-display')?.classList.add('rainbow-flash');
    if (typeof sounds !== 'undefined') sounds.easterEgg();
    triggerBubble('konami-code', character, 5000);
    setTimeout(() => {
      scoreEl.textContent = orig;
      scoreEl.closest('#score-display')?.classList.remove('rainbow-flash');
    }, 3000);
  }
}

/* ── Easter Egg: Avatar Click Counter ───────────────────────────────────────── */

let _avatarClickCount = 0;
let _avatarClickTimer = null;

function _handleAvatarClick(character) {
  _avatarClickCount++;
  clearTimeout(_avatarClickTimer);
  _avatarClickTimer = setTimeout(() => { _avatarClickCount = 0; }, 2000);

  if (_avatarClickCount >= 7) {
    _avatarClickCount = 0;
    const avatarEl = document.getElementById('char-avatar');
    if (avatarEl) {
      avatarEl.classList.add('spin');
      setTimeout(() => avatarEl.classList.remove('spin'), 600);
    }
    triggerBubble('avatar-spin', character, 4000);
  }
}

/* ── Easter Egg: "Score" title word click ────────────────────────────────────── */

let _scoreTitleClicks = 0;
let _scoreTitleTimer  = null;

function _handleScoreTitleClick(character) {
  _scoreTitleClicks++;
  clearTimeout(_scoreTitleTimer);
  _scoreTitleTimer = setTimeout(() => { _scoreTitleClicks = 0; }, 3000);

  if (_scoreTitleClicks >= 5) {
    _scoreTitleClicks = 0;
    // Show the hidden fun fact tooltip
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      const factTip = document.createElement('div');
      factTip.className = 'tooltip';
      factTip.style.cssText = 'display:block;opacity:1;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;max-width:300px;text-align:center;';
      factTip.textContent = 'Did you know? The very first FICO score was created in 1989.';
      document.body.appendChild(factTip);
      triggerBubble('score-fact', character, 4000);
      setTimeout(() => factTip.remove(), 4000);
    }
  }
}

/* ── Easter Egg: Score === 666 ───────────────────────────────────────────────── */

function checkDevilScore(score, character) {
  if (score !== 666) return;
  const scoreEl = document.getElementById('score-number');
  if (!scoreEl) return;
  const devil = document.createElement('span');
  devil.textContent = ' 👹';
  devil.className = 'devil-flash';
  scoreEl.parentNode.insertBefore(devil, scoreEl.nextSibling);
  setTimeout(() => devil.remove(), 2000);
}

/* ── Initialize Easter Egg Listeners ─────────────────────────────────────────── */

function initEasterEggs(gameState) {
  const character = () => gameState.character || 'toad';

  // Konami code
  document.addEventListener('keydown', e => _handleKonami(e, character(), gameState));

  // Avatar clicks
  const avatarEl = document.getElementById('char-avatar');
  if (avatarEl) {
    avatarEl.addEventListener('click', () => _handleAvatarClick(character()));
  }

  // "Score" label clicks (the score display area)
  const scoreLabel = document.getElementById('score-label');
  if (scoreLabel) {
    scoreLabel.addEventListener('click', () => _handleScoreTitleClick(character()));
  }
}
