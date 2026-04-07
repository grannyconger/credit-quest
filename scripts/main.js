/* ── Credit Quest: Main App Controller ──────────────────────────────────────── */

'use strict';

/* ── Game State ───────────────────────────────────────────────────────────────── */

const gameState = {
  playerName: '',
  character:  '',       // 'mario' | 'luigi' | 'peach' | 'toad'
  muted:      false,

  currentStage:       0, // 0=intro, 1, 2, 3, 4=report
  scenariosCompleted: [],
  scenarioQueue:      [], // drawn scenarios for current stage
  scenarioIndex:      0,  // which scenario in the queue we're on
  decisionsLog:       [], // { scenarioId, choiceIndex, scoreEffect }

  credit: makeCreditState(),

  bonusPoints:   0,
  quizDrawOrder: [],
  quizAnswered:  [],

  flags: {
    usedAuthorizedUser:    false,
    hadCollections:        false,
    hadLatePayment:        false,
    tookStudentLoans:      false,
    closedOldestAccount:   false,
    hadThinFile:           false,
    perfectPaymentHistory: true,
    stage3ApartmentResult: null,
    stage3CarAPR:          null,
    stage3JobResult:       null,
    foundEasterEgg:        false,
  },

  termsEncountered: new Set(),
};

/* ── Cached DOM refs ──────────────────────────────────────────────────────────── */

const el = {
  body:         document.body,
  container:    document.getElementById('stage-container'),
  scoreNumber:  document.getElementById('score-number'),
  scoreTier:    document.getElementById('score-tier'),
  scoreDelta:   document.getElementById('score-delta'),
  scoreDisplay: document.getElementById('score-display'),
  stageIndicator: document.getElementById('stage-indicator'),
  ficoBar:      document.getElementById('fico-bar'),
  charAvatar:   document.getElementById('char-avatar'),
  charName:     document.getElementById('char-name'),
  playerNameEl: document.getElementById('player-name-display'),
  muteBtn:      document.getElementById('mute-btn'),
  modalOverlay: document.getElementById('modal-overlay'),
  scoreModal:   document.getElementById('score-modal'),
};

/* ── Dictionary (loaded async) ───────────────────────────────────────────────── */

let _dict = null;

/* ── Score Animation ─────────────────────────────────────────────────────────── */

let _animScore = null; // current displayed score (for animation)

function animateScoreTo(targetScore, onDone) {
  const start = _animScore;
  if (start === targetScore) { if (onDone) onDone(); return; }

  const frames = 40;
  let frame = 0;

  function step() {
    frame++;
    const t = frame / frames;
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const val = start === null
      ? targetScore
      : Math.round(start + (targetScore - start) * eased);
    el.scoreNumber.textContent = val;
    _animScore = val;

    if (frame < frames) {
      requestAnimationFrame(step);
    } else {
      _animScore = targetScore;
      el.scoreNumber.textContent = targetScore;
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

function updateScoreDisplay(oldScore, newScore) {
  const tier = getScoreTier(newScore);

  if (newScore === null) {
    el.scoreNumber.textContent = '—';
    el.scoreNumber.style.color = tier.color;
    el.scoreTier.textContent   = 'No Score Yet';
    el.scoreTier.style.color   = tier.color;
    el.scoreDelta.textContent  = '';
    _animScore = null;
    updateFicoBars();
    return;
  }

  if (oldScore === null) _animScore = 300;

  animateScoreTo(newScore, () => {
    // Play sound after animation
    if (newScore > (oldScore || 0)) sounds.scoreUp();
    else if (newScore < (oldScore || 0)) sounds.scoreDown();

    // Easter egg
    checkDevilScore(newScore, gameState.character);
  });

  el.scoreNumber.style.color = tier.color;
  el.scoreTier.textContent   = tier.label;
  el.scoreTier.style.color   = tier.color;

  const change = describeScoreChange(oldScore, newScore);
  el.scoreDelta.textContent = change.label;
  el.scoreDelta.className   = `score-delta ${change.css}`;

  // Threshold bubble triggers
  if (newScore >= 750 && (oldScore === null || oldScore < 750)) {
    triggerBubble('score-750', gameState.character);
  } else if (newScore < 580 && (oldScore === null || oldScore >= 580)) {
    triggerBubble('score-580', gameState.character);
  }

  updateFicoBars();
}

function updateFicoBars() {
  if (!el.ficoBar) return;
  const subs = getFactorSubScores(gameState.credit);
  const keys  = ['paymentHistory', 'amountsOwed', 'lengthHistory', 'creditMix', 'newCredit'];
  const bars  = el.ficoBar.querySelectorAll('.fico-segment');
  bars.forEach((bar, i) => {
    const pct = subs[keys[i]] || 0;
    bar.style.setProperty('--bar-pct', `${pct}%`);
    bar.className = `fico-segment ${pct >= 70 ? 'good' : pct >= 40 ? 'fair' : 'poor'}`;
  });
}

/* ── Stage Dots ───────────────────────────────────────────────────────────────── */

function updateStageDots(stage) {
  if (!el.stageIndicator) return;
  el.stageIndicator.querySelectorAll('.stage-dot').forEach((dot, i) => {
    dot.classList.toggle('active',   i + 1 === stage);
    dot.classList.toggle('complete', i + 1 < stage);
  });
}

/* ── Render Helper ────────────────────────────────────────────────────────────── */

function setContent(html) {
  el.container.innerHTML = html;
  // Attach tooltips to any .term spans in the new content
  if (_dict) {
    attachTooltips(el.container, _dict);
    trackTerms(el.container, gameState);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* EXPLAIN MORE — Dynamic FICO explanation generator                              */
/* ═══════════════════════════════════════════════════════════════════════════════ */

function generateDeepExplanation(choice) {
  const effects = choice.effects || {};
  const lines = [];

  if (effects.hasAnyCredit) {
    lines.push('<strong>🏁 Credit History Started</strong> — This account officially opened your credit file with the bureaus. FICO requires at least 6 months of history before it can generate a score. The clock is now running — every on-time payment from here builds your record.');
  }

  if (effects.paymentHistory) {
    const ph = effects.paymentHistory;
    if (ph.latePayments30) {
      lines.push('<strong>⚠️ 30-Day Late Payment (−35 pts)</strong> — Payment History is 35% of your FICO Score — the single biggest factor. A 30-day late stays on your Credit Report for 7 years. The damage fades over time, but only consistent on-time payments rebuild it.');
      lines.push('Recovery tip: Set up autopay for at least the minimum so this never happens again. One late payment can drop a good score by 50–100+ points overnight.');
    }
    if (ph.latePayments60) {
      lines.push('<strong>🚨 60-Day Late Payment (−60 pts)</strong> — More damaging than a 30-day late because it signals you ignored the first warning. Lenders see this as a significant reliability problem. Recovery requires 12–24 months of clean payment history to meaningfully offset it.');
    }
    if (ph.defaults) {
      lines.push('<strong>💥 Default / Charge-Off (−90 pts)</strong> — The lender gave up trying to collect. This is one of the worst marks on a credit report and stays for 7 years. It can drop a good score by 100–150 points and will cause loan denials, high rates, and deposit requirements for years.');
    }
    if (ph.collections) {
      lines.push('<strong>📉 Collections Account (−75 pts)</strong> — A third-party collector now owns your debt and reports it separately. Collections accounts are heavily penalized by FICO even after paid — many newer scoring models ignore paid collections, but older ones (still widely used) still count them.');
    }
    if (ph.removeCollection) {
      lines.push('<strong>✅ Collection Removed</strong> — Successfully negotiating a "pay-for-delete" (where the collector removes the entry in exchange for payment) is one of the few ways to erase a collections mark before its 7-year expiration.');
    }
    if (ph.delta > 0) {
      lines.push('<strong>✅ On-Time Payment Recorded</strong> — Payment History (35%) rewards consistency above all else. Each payment reinforces your reliability. A long streak of on-time payments is the single most powerful thing you can do to build and protect your score.');
    }
  }

  if (effects.amountsOwed) {
    const ao = effects.amountsOwed;
    if (ao.limitDelta > 0 && ao.balanceDelta > 0) {
      const util = ao.limitDelta > 0 ? Math.round((ao.balanceDelta / ao.limitDelta) * 100) : 0;
      if (util >= 75) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — This is in the danger zone. FICO heavily penalizes utilization over 30%, and above 75% it's a major red flag. Even if you plan to pay it off next month, the reported balance was already sent to the bureaus at your statement date.`);
      } else if (util >= 30) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — You're above the 30% sweet spot. Amounts Owed is worth 30% of your score — keeping balances below 30% of your total limit keeps this factor healthy.`);
      } else if (util > 0) {
        lines.push(`<strong>💳 Utilization at ~${util}% (Amounts Owed, 30%)</strong> — Low utilization. FICO rewards keeping balances well below your limit. Under 10% is ideal; under 30% is solid.`);
      }
    }
    if (ao.balanceDelta < 0 || ao.balanceClear) {
      lines.push('<strong>📉 Balance Paid Down (Amounts Owed, 30%)</strong> — Reducing your balance directly improves your utilization ratio. The lower your balance relative to your limit, the better your Amounts Owed factor. Paying to zero is the best outcome — 0% utilization is ideal.');
    }
    if (ao.limitClose) {
      lines.push('<strong>⚠️ Credit Limit Reduced (Closing Account)</strong> — Closing a card removes its limit from your total available credit. If you still carry balances elsewhere, this spikes your overall utilization ratio — sometimes dramatically. This is why financial advisors say "never close your oldest card."');
    }
  }

  if (effects.lengthHistory) {
    const lh = effects.lengthHistory;
    if (lh.delta > 0) {
      lines.push('<strong>📅 Length of Credit History (15%)</strong> — Time in the game. The older your oldest account, the more this factor works in your favor. You can\'t rush it — every month an account stays open adds to your history. This is a slow burn that rewards patience and starting early.');
    }
    if (lh.delta < 0) {
      lines.push('<strong>📅 Credit Age Shortened (Length of History, 15%)</strong> — Closing your oldest account shortens your average credit age. Lenders use account age to measure long-term reliability. Once closed, the history eventually falls off your report entirely (usually after 10 years).');
    }
  }

  if (effects.creditMix) {
    const cm = effects.creditMix;
    if (cm.hasInstallmentLoan) {
      lines.push('<strong>🔄 Installment Loan Added (Credit Mix, 10%)</strong> — Credit Mix rewards having both revolving credit (cards) and installment loans (car, student, personal). You just added a new type. This factor doesn\'t warrant taking on debt you don\'t need, but it\'s a nice bonus when you have a legitimate reason.');
    }
    if (cm.hasRevolvingCredit) {
      lines.push('<strong>🔄 Revolving Credit Added (Credit Mix, 10%)</strong> — Having a credit card (revolving) alongside loans (installment) improves your mix. Credit Mix is only 10% of your score, but it adds up over a full game.');
    }
    if (cm.hasMortgage) {
      lines.push('<strong>🏡 Mortgage Added (Credit Mix, 10%)</strong> — A mortgage is the gold standard of credit mix. It maxes out your Credit Mix factor and your mortgage payments become your most impactful Payment History opportunity — the biggest loan most people ever carry.');
    }
  }

  if (effects.newCredit) {
    const nc = effects.newCredit;
    if (nc.hardInquiries >= 3) {
      lines.push(`<strong>🔍 ${nc.hardInquiries} Hard Inquiries (New Credit, 10%)</strong> — Multiple applications in a short window signal financial stress to lenders. Each Hard Inquiry stays on your report for 2 years (affects your score for about 12 months). The damage isn't catastrophic from one, but stacking them compounds fast.`);
    } else if (nc.hardInquiries >= 1) {
      lines.push(`<strong>🔍 Hard Inquiry (New Credit, 10%)</strong> — Applying for credit triggers a Hard Inquiry. A single inquiry costs only a few points and fades after 12 months. The key is not stacking multiple applications in a short window — that's when it starts hurting meaningfully.`);
    }
  }

  if (Object.keys(effects).length === 0 || lines.length === 0) {
    lines.push('<strong>ℹ️ No Direct Score Impact</strong> — Not every financial decision moves your credit score. Some choices build safety nets that protect your score indirectly — like an Emergency Fund that prevents you from missing a payment during a financial shock.');
  }

  return lines.join('<br><br>');
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* WHIMSICAL EFFECTS                                                               */
/* ═══════════════════════════════════════════════════════════════════════════════ */

function spawnReportStars() {
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

function spawnScoreDeltaFloat(deltaText, color) {
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

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* SCREENS                                                                        */
/* ═══════════════════════════════════════════════════════════════════════════════ */

/* ── 0: Character Select ─────────────────────────────────────────────────────── */

const CHARACTER_DATA = {
  mario: { emoji: '🔴', img: './images/mario.jpg', primary: '#DC2626', blurb: 'The ambitious go-getter. Ready to level up — financially.' },
  luigi: { emoji: '🟢', img: './images/luigi.jpg', primary: '#16A34A', blurb: 'Cautious, methodical, perpetually underestimated. Let\'s change that.' },
  peach: { emoji: '🩷', img: './images/peach.jpg', primary: '#EC4899', blurb: 'Royalty doesn\'t wait for good credit. Royalty builds it.' },
  toad:  { emoji: '🟣', img: './images/toad.jpg',  primary: '#7C3AED', blurb: 'Chaotic energy. Questionable decisions. Somehow still thriving.' },
};

function showCharacterSelect() {
  gameState.currentStage = 0;
  updateStageDots(0);

  const cards = Object.entries(CHARACTER_DATA).map(([id, data]) => `
    <button class="char-card" data-char="${id}" style="--cc-primary:${data.primary}">
      <div class="char-card-header">
        <div class="char-card-avatar" style="background:${data.primary}">
            <img src="${data.img}" alt="${id}"
              onerror="this.style.display='none';this.parentNode.textContent='${data.emoji}'">
          </div>
        <div class="char-card-name">${id.charAt(0).toUpperCase() + id.slice(1)}</div>
      </div>
      <div class="char-card-blurb">${data.blurb}</div>
    </button>
  `).join('');

  // Title splash overlay
  const splash = document.createElement('div');
  splash.id = 'title-splash';
  splash.innerHTML = `<span class="title-splash-word boogaloo">Credit Quest</span>`;
  document.body.appendChild(splash);

  setContent(`
    <div class="intro-card card char-select-fade-in" style="max-width:860px;margin:0 auto;opacity:0;">
      <h1 class="boogaloo" style="font-size:3rem;margin-bottom:0;letter-spacing:0.04em;color:#1a1a2e;">Credit Quest</h1>
      <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.9rem;margin-top:0.1rem;">A life-sim credit score adventure</p>

      <label style="display:block;margin-bottom:0.5rem;font-weight:700;">Your Name</label>
      <input id="name-input" type="text" placeholder="Enter your name…"
        style="width:100%;padding:10px 14px;border-radius:8px;border:2px solid var(--char-primary);
               background:#1a1a2e;color:#fff;font-family:inherit;font-size:1rem;
               box-sizing:border-box;margin-bottom:1.5rem;"
        maxlength="24">

      <label style="display:block;margin-bottom:0.75rem;font-weight:700;">Choose Your Character</label>
      <div class="char-grid">${cards}</div>

      <button id="start-btn" class="choice-btn" style="width:100%;margin-top:1.5rem;font-size:1rem;opacity:0.4;cursor:not-allowed;" disabled>
        START GAME →
      </button>
    </div>
  `);

  const introCard = el.container.querySelector('.intro-card');

  // Fade in the char-select card after splash animation (~2s)
  setTimeout(() => {
    if (splash.parentNode) splash.parentNode.removeChild(splash);
    introCard.style.opacity = '1';
    introCard.style.transition = 'opacity 400ms ease';
  }, 2000);

  // onstart sound: play on first user gesture (autoplay policy requires this)
  let _onstartPlayed = false;
  async function _tryOnstart() {
    if (_onstartPlayed) return;
    _onstartPlayed = true;
    document.removeEventListener('click',   _tryOnstart);
    document.removeEventListener('keydown', _tryOnstart);
    await initAudio();
    sounds.onstart();
  }
  document.addEventListener('click',   _tryOnstart);
  document.addEventListener('keydown', _tryOnstart);

  let selectedChar = '';

  el.container.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      el.container.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChar = card.dataset.char;
      initAudio().then(() => sounds.introChar(card.dataset.char));
      checkReady();
    });
  });

  const nameInput = el.container.querySelector('#name-input');
  let _startPlayed = false;
  nameInput.addEventListener('focus', async () => {
    if (_startPlayed) return;
    _startPlayed = true;
    await initAudio();
    sounds.start();
  });
  nameInput.addEventListener('input', () => { checkReady(); });

  function checkReady() {
    const ready = nameInput.value.trim().length > 0 && selectedChar !== '';
    const btn = el.container.querySelector('#start-btn');
    btn.disabled = !ready;
    btn.style.opacity = ready ? '1' : '0.4';
    btn.style.cursor  = ready ? 'pointer' : 'not-allowed';
    if (ready) {
      btn.classList.add('btn-ready');
    } else {
      btn.classList.remove('btn-ready');
    }
  }

  el.container.querySelector('#start-btn').addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name || !selectedChar) return;
    sounds.click();
    startGame(name, selectedChar);
  });
}

/* ── Start Game ──────────────────────────────────────────────────────────────── */

function startGame(name, character) {
  gameState.playerName   = name;
  gameState.character    = character;
  gameState.quizDrawOrder = initQuizDrawOrder();

  // Apply character theme
  el.body.className = character;

  // Update persistent header
  el.playerNameEl.textContent = name;
  el.charName.textContent     = character.charAt(0).toUpperCase() + character.slice(1);
  const _cd = CHARACTER_DATA[character];
  el.charAvatar.innerHTML = `<img src="${_cd.img}" alt="${character}"
    style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"
    onerror="this.parentNode.textContent='${_cd.emoji}'">`;

  updateScoreDisplay(null, null);

  triggerBubble('game-start', character);
  initEasterEggs(gameState);

  showIntro(0);
}

/* ── Intro Card Sequence ─────────────────────────────────────────────────────── */

const INTRO_CARDS = [
  (name) => `
    <h2>Welcome, ${name}.</h2>
    <p>You've just turned 16 — and somewhere out there, three organizations called
    <span class="term" data-term="credit-bureau">Credit Bureaus</span> have just started a file on you.
    Everything you do with borrowed money goes into that file. That file becomes your
    <span class="term" data-term="credit-report">Credit Report</span>. That report gets turned into a number:
    your <span class="term" data-term="credit-score">Credit Score</span>.</p>
  `,
  () => `
    <h2>Why It Matters</h2>
    <p>Your <span class="term" data-term="credit-score">Credit Score</span> is a number between 300 and 850.
    Landlords, banks, car dealers, and even some employers use it to decide how much they trust you with money.
    A high score opens doors. A low score — or no score at all — closes them.</p>
  `,
  () => `
    <h2>Your Starting Point</h2>
    <p>Right now? You have a <span class="term" data-term="thin-file">Thin File</span>. No
    <span class="term" data-term="credit-history">Credit History</span> at all. Which means you have no score.
    Over the next few years of this simulation, you'll make real decisions that either build that file
    — or leave it empty. Either way, there are consequences.</p>
  `,
  () => `
    <h2>The #1 Rule</h2>
    <div class="rule-box">
      <p style="margin:0;font-weight:700;font-size:1.05rem;color:var(--char-accent);">⚡ THE #1 RULE OF THIS GAME</p>
    </div>
    <p><span class="term" data-term="payment-history">Payment History</span> is <strong>35%</strong> of your
    <span class="term" data-term="fico-score">FICO Score</span> — the biggest single factor. The #2 rule:
    <span class="term" data-term="amounts-owed">Amounts Owed</span> (your
    <span class="term" data-term="credit-utilization-rate">Credit Utilization Rate</span>) is <strong>30%</strong>.
    Together, these two things control <strong>65%</strong> of your score.
    <em>Never. Miss. A payment. Never max out your cards.</em></p>
  `,
];

function showIntro(cardIndex) {
  if (cardIndex >= INTRO_CARDS.length) {
    beginStage(1);
    return;
  }

  const isLast = cardIndex === INTRO_CARDS.length - 1;
  const cardHTML = INTRO_CARDS[cardIndex](gameState.playerName);

  setContent(`
    <div class="instruction-card" style="max-width:600px;margin:0 auto;">
      <div class="instruction-badge">📋 How to Play &nbsp;·&nbsp; ${cardIndex + 1} / ${INTRO_CARDS.length}</div>
      ${cardHTML}
      <div style="display:flex;justify-content:flex-end;margin-top:1.5rem;">
        <button class="choice-btn" id="intro-next-btn">
          ${isLast ? 'BEGIN STAGE 1 →' : 'NEXT →'}
        </button>
      </div>
    </div>
  `);

  el.container.querySelector('#intro-next-btn').addEventListener('click', () => {
    sounds.click();
    showIntro(cardIndex + 1);
  });

  // Show no-score bubble on first intro
  if (cardIndex === 0) {
    setTimeout(() => triggerBubble('no-score-first', gameState.character), 800);
  }
}

/* ── Stage Transition ─────────────────────────────────────────────────────────── */

function beginStage(stageNum) {
  gameState.currentStage = stageNum;
  updateStageDots(stageNum);

  // Stage transition scoring
  if (stageNum > 1) {
    applyStageTransition(gameState.credit);
    const newScore = calculateFICOScore(gameState.credit);
    updateScoreDisplay(_animScore, newScore);
  }

  // Thin file warning
  if (stageNum === 2 && !gameState.credit.hasAnyCredit) {
    gameState.flags.hadThinFile = true;
    showThinFileWarning();
    return;
  }

  // Draw scenarios for this stage
  const pool = stageNum === 1 ? stage1Pool : stageNum === 2 ? stage2Pool : stage3Pool;
  gameState.scenarioQueue = drawScenarios(pool);
  gameState.scenarioIndex = 0;

  showStageIntroCard(stageNum);
}

function showThinFileWarning() {
  el.scoreDisplay?.classList.add('thin-file-warning');
  setTimeout(() => el.scoreDisplay?.classList.remove('thin-file-warning'), 4000);

  triggerBubble('thin-file-warning', gameState.character, 5000);

  setContent(`
    <div class="card" style="max-width:600px;margin:0 auto;border-color:#DC2626;">
      <div style="font-size:2rem;margin-bottom:0.5rem;">⚠️</div>
      <h2 class="orbitron" style="color:#DC2626;margin-bottom:0.75rem;">Thin File Warning</h2>
      <p>You're entering college with <strong>no credit history</strong>. This is going to make
      several decisions harder. Lenders see you as an unknown — and unknown is risky to them.</p>
      <p>Stage 2 will give you opportunities to start building. Don't miss them.</p>
      <div style="display:flex;justify-content:flex-end;margin-top:1.5rem;">
        <button class="choice-btn" id="thin-file-ok">GOT IT →</button>
      </div>
    </div>
  `);

  el.container.querySelector('#thin-file-ok').addEventListener('click', () => {
    sounds.click();
    const pool = stage2Pool;
    gameState.scenarioQueue = drawScenarios(pool);
    gameState.scenarioIndex = 0;
    showStageIntroCard(2);
  });
}

const STAGE_LABELS = {
  1: { title: 'Stage 1: High School',  sub: 'Ages 16–18 · Building the Foundation' },
  2: { title: 'Stage 2: College',      sub: 'Ages 18–22 · The Critical Years' },
  3: { title: 'Stage 3: Young Adult',  sub: 'Ages 22–25 · Reality Hits Hard' },
};

function showStageIntroCard(stageNum) {
  // Play character intro sound at the start of stage 2 and 3
  if (stageNum >= 2) {
    initAudio().then(() => sounds.introChar(gameState.character));
  }

  const info = STAGE_LABELS[stageNum];
  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);

  setContent(`
    <div class="card" style="max-width:600px;margin:0 auto;text-align:center;">
      <div class="orbitron" style="font-size:0.8rem;color:#374151;letter-spacing:0.12em;margin-bottom:0.5rem;">
        ${info.title.toUpperCase()}
      </div>
      <h2 class="orbitron" style="color:var(--char-primary);font-size:1.4rem;margin-bottom:0.5rem;">${info.title}</h2>
      <p style="color:#4B5563;margin-bottom:1.25rem;">${info.sub}</p>
      <img class="stage-intro-img" src="./images/stage${stageNum}.png"
        onerror="this.style.display='none'" alt="${info.title}">
      <p>You're about to face <strong>4 financial decisions</strong> drawn from a pool of 10.
      Every choice you make affects your
      <span class="term" data-term="credit-score">Credit Score</span>.</p>
      ${score ? `<p style="margin-top:0.75rem;">Starting this stage at
        <strong style="color:${tier.color}">${score} — ${tier.label}</strong>
      </p>` : ''}
      <div style="display:flex;justify-content:center;margin-top:1.5rem;">
        <button class="choice-btn" id="stage-go-btn">LET'S GO →</button>
      </div>
    </div>
  `);

  el.container.querySelector('#stage-go-btn').addEventListener('click', () => {
    sounds.click();
    showNextScenario();
  });

  // Stage image lightbox — click to spin/expand into a modal
  const stageImg = el.container.querySelector('.stage-intro-img');
  if (stageImg) {
    stageImg.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;cursor:zoom-out;transition:background 300ms ease;';
      const bigImg = document.createElement('img');
      bigImg.src = stageImg.src;
      bigImg.alt = stageImg.alt;
      bigImg.style.cssText = 'max-width:90vw;max-height:85vh;border:8px solid #fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.8);object-fit:contain;transform:scale(0.05) rotate(-360deg);transition:transform 550ms cubic-bezier(0.34,1.56,0.64,1);';
      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.style.background = 'rgba(0,0,0,0.88)';
        bigImg.style.transform = 'scale(1) rotate(0deg)';
      });
      overlay.addEventListener('click', () => {
        overlay.style.background = 'rgba(0,0,0,0)';
        bigImg.style.transform = 'scale(0.05) rotate(360deg)';
        bigImg.style.transition = 'transform 400ms cubic-bezier(0.55,0,1,0.45)';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 420);
      });
    });
  }
}

/* ── Scenario Rendering ───────────────────────────────────────────────────────── */

function showNextScenario() {
  const queue = gameState.scenarioQueue;
  if (!queue || gameState.scenarioIndex >= queue.length) {
    const stageNum = gameState.currentStage;
    if (stageNum > 0 && stageNum < 3) {
      showQuizBridge(stageNum);
    } else if (stageNum === 3) {
      showReportCard();
    }
    return;
  }
  const scenario = queue[gameState.scenarioIndex];
  if (scenario.type === 'consequence-event') {
    renderConsequenceEvent(scenario);
  } else {
    renderScenario(scenario);
  }
}

function renderScenario(scenario) {
  const charBubbleText = scenario.characterBubble?.[gameState.character];
  const bubbleHTML = charBubbleText
    ? `<div class="card-bubble">${charBubbleText}</div>`
    : '';

  const choicesHTML = scenario.choices.map((choice, i) => `
    <button class="choice-btn scenario-choice" data-index="${i}" style="display:block;width:100%;margin-bottom:0.75rem;text-align:left;">
      <span style="font-weight:700;margin-right:0.5rem;">${String.fromCharCode(65 + i)}.</span>
      ${choice.label}
    </button>
  `).join('');

  const stageInfo = STAGE_LABELS[gameState.currentStage];

  setContent(`
    <div class="scenario-wrapper" style="max-width:640px;margin:0 auto;">
      <div class="card" id="scenario-card">
        <div style="font-size:0.75rem;color:#374151;font-weight:600;letter-spacing:0.1em;margin-bottom:0.5rem;">
          ${scenario.setting} &nbsp;·&nbsp; ${gameState.scenarioIndex + 1} of ${gameState.scenarioQueue.length}
        </div>
        <h2 style="font-size:1.15rem;font-weight:700;color:var(--char-accent);margin-bottom:0.75rem;">
          ${scenario.title}
        </h2>
        ${bubbleHTML}
        <div class="scenario-narrative" style="margin-bottom:1rem;line-height:1.7;">
          ${scenario.narrative}
        </div>
        <div style="font-weight:700;margin-bottom:0.75rem;color:var(--char-accent);">
          ❓ ${scenario.decision}
        </div>
        <div id="choices-area">
          ${choicesHTML}
        </div>
      </div>
    </div>
  `);

  el.container.querySelectorAll('.scenario-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      recordChoice(scenario, idx);
    });
  });
}

/* ── Consequence Event (no choices — score determines outcome) ───────────────── */

function renderConsequenceEvent(scenario) {
  const score = calculateFICOScore(gameState.credit);

  // Find matching outcome (highest minScore first)
  const sorted = [...scenario.outcomesByScore].sort((a, b) => b.minScore - a.minScore);
  const outcome = sorted.find(o => score !== null && score >= o.minScore)
    || sorted[sorted.length - 1]; // fallback to worst

  // Store flag if needed
  if (outcome.flagKey) {
    gameState.flags[outcome.flagKey] = outcome.flagValue;
  }

  const stageInfo = STAGE_LABELS[gameState.currentStage];

  setContent(`
    <div class="scenario-wrapper" style="max-width:640px;margin:0 auto;">
      <div class="card" id="scenario-card">
        <div style="font-size:0.75rem;color:#374151;font-weight:600;letter-spacing:0.1em;margin-bottom:0.5rem;">
          ${scenario.setting} &nbsp;·&nbsp; ${gameState.scenarioIndex + 1} of ${gameState.scenarioQueue.length}
        </div>
        <h2 style="font-size:1.15rem;font-weight:700;color:var(--char-accent);margin-bottom:0.75rem;">
          ${scenario.title}
        </h2>
        <div class="scenario-narrative" style="margin-bottom:1rem;line-height:1.7;">
          ${scenario.narrative}
        </div>
        <div id="consequence-area"></div>
        ${scenario.id === 's3-01' ? `
          <div class="apartment-result-callout">
            📊 Your credit score is being evaluated right now — this is the first real-world consequence of every decision you've made since high school.
          </div>
          <button class="apartment-result-btn" id="event-next-btn">🏠 REVEAL MY APARTMENT RESULT →</button>
        ` : `
          <div style="display:flex;justify-content:flex-end;margin-top:1rem;">
            <button class="choice-btn" id="event-next-btn">SEE MY RESULT →</button>
          </div>
        `}
      </div>
    </div>
  `);

  el.container.querySelector('#event-next-btn').addEventListener('click', () => {
    sounds.click();
    showConsequenceResult(scenario, outcome, null);
  });
}

/* ── Record Player Choice ─────────────────────────────────────────────────────── */

function recordChoice(scenario, choiceIndex) {
  const choice    = scenario.choices[choiceIndex];
  const oldScore  = calculateFICOScore(gameState.credit);

  // Apply effects
  applyEffects(choice.effects, gameState.credit, gameState.flags);

  const newScore = calculateFICOScore(gameState.credit);

  // Log the decision
  gameState.decisionsLog.push({
    scenarioId:    scenario.id,
    scenarioTitle: scenario.title,
    stage:         gameState.currentStage,
    choiceIndex,
    choiceLabel: choice.label,
    oldScore,
    newScore,
    scoreEffect: (newScore !== null && oldScore !== null) ? newScore - oldScore : null,
  });

  // Sound
  const delta = (newScore || 0) - (oldScore || 0);
  if (delta > 0)      sounds.goodChoice();
  else if (delta < 0) sounds.badChoice();
  else                sounds.bubblePop();

  // Special bubble triggers
  if (choice.effects?.newCredit?.hardInquiries >= 2) {
    triggerBubble('multiple-inquiries', gameState.character);
  }
  if (choice.effects?.paymentHistory?.latePayments30 || choice.effects?.paymentHistory?.latePayments60) {
    // late payment
  }
  if (scenario.id === 'S3-09' && choiceIndex === 1) {
    // Credit repair scam — choice B
    setTimeout(() => triggerBubble('consequence-S3-09-B', gameState.character), 1500);
  }

  showConsequenceResult(scenario, choice, { oldScore, newScore });
}

/* ── Show Consequence Card ────────────────────────────────────────────────────── */

function showConsequenceResult(scenario, choice, scoreData) {
  // Update score display
  if (scoreData) {
    updateScoreDisplay(scoreData.oldScore, scoreData.newScore);
  }

  const change = scoreData
    ? describeScoreChange(scoreData.oldScore, scoreData.newScore)
    : { label: '', css: 'neutral' };

  const consequenceBubble = choice.consequenceBubble?.[gameState.character];

  // Factor highlights
  const factorHighlights = (choice.factorHighlight || []).map(f => {
    const meta = FACTOR_META.find(m => m.key === f || m.key === f.replace(/-/g, ''));
    if (!meta) return '';
    const sub = getFactorSubScores(gameState.credit)[meta.key] || 0;
    return `<div class="factor-row">
      <span class="factor-label">${meta.label}</span>
      <div class="factor-bar-track"><div class="factor-bar-fill" style="width:${sub}%"></div></div>
      <span class="factor-pct">${meta.pct}</span>
    </div>`;
  }).join('');

  const conseqCard = document.createElement('div');
  conseqCard.className = 'consequence-card card-dark';
  conseqCard.innerHTML = `
    <div style="font-size:1.8rem;margin-bottom:0.5rem;">${choice.consequenceEmoji || '📋'}</div>
    <h3 style="color:var(--char-accent);margin-bottom:0.75rem;">${choice.consequenceTitle || 'What Happened'}</h3>
    <p style="line-height:1.7;margin-bottom:1rem;">${choice.consequenceText || choice.text || ''}</p>
    ${scoreData ? `
    <div class="score-impact-row" style="margin-bottom:1rem;">
      <span class="score-impact-label">SCORE IMPACT:</span>
      <span class="score-delta ${change.css}" style="font-size:1.1rem;font-weight:700;">${change.label}</span>
    </div>
    ` : ''}
    ${factorHighlights ? `<div class="factor-highlights" style="margin-bottom:1rem;">${factorHighlights}</div>` : ''}
    ${consequenceBubble ? `<div class="card-bubble" style="margin-bottom:1rem;">${consequenceBubble}</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;flex-wrap:wrap;gap:0.5rem;">
      ${scoreData ? '<button class="explain-more-btn" id="explain-btn">🔍 Explain More</button>' : '<span></span>'}
      <button class="choice-btn" id="next-btn">NEXT →</button>
    </div>
    ${scoreData ? '<div class="explain-more-panel" id="explain-panel"></div>' : ''}
  `;

  // Append below existing card (so player can see choice context)
  const wrapper = el.container.querySelector('.scenario-wrapper');
  if (wrapper) {
    // Disable choice buttons
    wrapper.querySelectorAll('.scenario-choice, #event-next-btn').forEach(b => {
      b.disabled = true;
      b.style.opacity = '0.5';
    });
    wrapper.appendChild(conseqCard);
    conseqCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    el.container.appendChild(conseqCard);
  }

  // Factor highlights animate in after 200ms
  setTimeout(() => {
    conseqCard.querySelectorAll('.factor-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => {
        bar.style.transition = 'width 600ms ease-out';
        bar.style.width = w;
      });
    });
  }, 200);

  // Explain More toggle (only present for player-choice consequences, not consequence-events)
  const explainBtn   = conseqCard.querySelector('#explain-btn');
  const explainPanel = conseqCard.querySelector('#explain-panel');
  if (explainBtn && explainPanel) explainBtn.addEventListener('click', () => {
    sounds.click();
    const open = explainPanel.classList.toggle('open');
    explainBtn.textContent = open ? '🔍 Show Less' : '🔍 Explain More';
    if (open && !explainPanel.innerHTML) {
      explainPanel.innerHTML = generateDeepExplanation(choice);
    }
    if (open) explainPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });  // end if explainBtn

  conseqCard.querySelector('#next-btn').addEventListener('click', () => {
    sounds.click();
    gameState.scenarioIndex++;
    showNextScenario();
  });
}

/* ── Quiz Bridge ─────────────────────────────────────────────────────────────── */

function showQuizBridge(completedStage) {
  sounds.stageComplete();
  triggerBubble('stage-complete', gameState.character);

  // Level-up banner
  const banner = document.createElement('div');
  banner.id = 'level-up-banner';
  banner.textContent = `🌟 Stage ${completedStage} Complete! 🌟`;
  banner.classList.add('in');
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.classList.remove('in');
    banner.classList.add('out');
    setTimeout(() => { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 420);
  }, 1800);

  const bridgeNum = completedStage; // bridge 1 after stage 1, bridge 2 after stage 2
  const questions = getQuizBatch(gameState.quizDrawOrder, bridgeNum);
  gameState.quizAnswered.push(...questions.map(q => q.id));

  showQuizCard(questions, 0, completedStage);
}

function showQuizCard(questions, qIndex, completedStage) {
  if (qIndex >= questions.length) {
    // Quiz done
    beginStage(completedStage + 1);
    return;
  }

  const q = questions[qIndex];
  const letters = ['A', 'B', 'C', 'D'];

  const choicesHTML = letters.map(letter => `
    <button class="quiz-choice-btn" data-letter="${letter}">
      <span class="quiz-letter-circle">${letter}</span>
      <span class="quiz-choice-text">${q.choices[letter]}</span>
    </button>
  `).join('');

  setContent(`
    <div class="card" style="max-width:640px;margin:0 auto;">
      <div style="font-size:0.75rem;color:#374151;font-weight:700;letter-spacing:0.1em;margin-bottom:0.5rem;">
        KNOWLEDGE CHECK · ${qIndex + 1} OF ${questions.length}
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
        <span style="font-size:1.5rem;">🧠</span>
        <h2 style="font-size:1.05rem;font-weight:700;color:var(--char-accent);">Extra Credit Points!</h2>
      </div>
      <p style="font-weight:600;line-height:1.6;margin-bottom:1.25rem;">${q.question}</p>
      <div id="quiz-choices">${choicesHTML}</div>
      <div id="quiz-result" style="display:none;"></div>
    </div>
  `);

  el.container.querySelectorAll('.quiz-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const letter = btn.dataset.letter;
      handleQuizAnswer(q, letter, questions, qIndex, completedStage);
    });
  });
}

function handleQuizAnswer(q, chosen, questions, qIndex, completedStage) {
  const correct = chosen === q.answer;

  if (correct) {
    gameState.bonusPoints += 5;
    gameState.credit.quizBonus = (gameState.credit.quizBonus || 0) + 5;
    if (gameState.credit.hasAnyCredit) {
      const qs = calculateFICOScore(gameState.credit);
      updateScoreDisplay(_animScore, qs);
      spawnScoreDeltaFloat('+5', '#4ADE80');
    }
    sounds.quizCorrect();
  } else {
    sounds.quizWrong();
  }

  // Mark buttons
  el.container.querySelectorAll('.quiz-choice-btn').forEach(btn => {
    btn.disabled = true;
    const letter = btn.dataset.letter;
    if (letter === q.answer) btn.classList.add('correct');
    else if (letter === chosen && !correct) btn.classList.add('wrong');
  });

  const resultEl = el.container.querySelector('#quiz-result');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div style="margin-top:1rem;padding:1rem;border-radius:8px;background:${correct ? '#14532D' : '#7F1D1D'};border:1px solid ${correct ? '#22C55E' : '#EF4444'};">
      <div style="font-weight:700;margin-bottom:0.5rem;color:${correct ? '#4ADE80' : '#FCA5A5'};">
        ${correct ? '✅ Correct! +5 Bonus Points' : `❌ The correct answer was ${q.answer}`}
      </div>
      <p style="font-size:0.9rem;color:#E5E7EB;margin:0;">${q.explanation}</p>
    </div>
    ${q.deepDive ? `
    <div style="margin-top:0.5rem;">
      <button class="explain-more-btn" id="quiz-explain-btn">🔍 Explain More</button>
      <div class="explain-more-panel" id="quiz-explain-panel">${q.deepDive}</div>
    </div>
    ` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;">
      <span style="color:#374151;font-size:0.85rem;line-height:1.6;">Bonus Points:<br><strong style="color:#111827;">${gameState.bonusPoints} / 30</strong></span>
      <button class="choice-btn" id="quiz-next-btn">
        ${qIndex + 1 < questions.length ? 'NEXT QUESTION →' : 'CONTINUE →'}
      </button>
    </div>
  `;

  const quizExplainBtn = resultEl.querySelector('#quiz-explain-btn');
  if (quizExplainBtn) {
    const panel = resultEl.querySelector('#quiz-explain-panel');
    quizExplainBtn.addEventListener('click', () => {
      sounds.click();
      const open = panel.classList.toggle('open');
      quizExplainBtn.textContent = open ? '🔍 Show Less' : '🔍 Explain More';
    });
  }

  el.container.querySelector('#quiz-next-btn').addEventListener('click', () => {
    sounds.click();
    showQuizCard(questions, qIndex + 1, completedStage);
  });
}

/* ── Score Modal ─────────────────────────────────────────────────────────────── */

function openScoreModal() {
  if (!el.scoreModal || !el.modalOverlay) return;
  sounds.modalOpen();

  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);
  const subs  = getFactorSubScores(gameState.credit);

  const factorRows = FACTOR_META.map(m => {
    const pct = subs[m.key] || 0;
    return `
      <div class="modal-factor-row" style="margin-bottom:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-size:0.85rem;font-weight:600;">
            ${m.priority ? '🔴' : '⚪'}&nbsp;
            <span class="term" data-term="${m.key.replace(/([A-Z])/g, '-$1').toLowerCase()}">${m.label}</span>
          </span>
          <span style="font-size:0.8rem;color:#9CA3AF;">${m.pct}</span>
        </div>
        <div style="background:#374151;border-radius:4px;height:8px;overflow:hidden;">
          <div class="modal-factor-fill" data-pct="${pct}"
            style="height:100%;width:0;background:${pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444'};
            border-radius:4px;transition:width 600ms ease-out;"></div>
        </div>
      </div>
    `;
  }).join('');

  const tiers = [
    { label: 'Poor',        range: '300–579', req: score && score < 580 },
    { label: 'Fair',        range: '580–669', req: score && score >= 580 && score < 670 },
    { label: 'Good',        range: '670–739', req: score && score >= 670 && score < 740 },
    { label: 'Very Good',   range: '740–799', req: score && score >= 740 && score < 800 },
    { label: 'Exceptional', range: '800–850', req: score && score >= 800 },
  ];
  const tierRows = tiers.map(t => `
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.4rem;
      ${t.req ? 'font-weight:700;color:var(--char-accent)' : 'color:#6B7280'}">
      <span style="min-width:100px;font-size:0.85rem;">${t.label}</span>
      <span style="font-size:0.8rem;">${t.range}</span>
      ${t.req ? '<span style="font-size:0.8rem;">← YOU ARE HERE</span>' : ''}
    </div>
  `).join('');

  el.scoreModal.innerHTML = `
    <button id="modal-close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;
      color:#9CA3AF;font-size:1.25rem;cursor:pointer;padding:4px 8px;">✕</button>
    <h2 class="orbitron" style="text-align:center;color:var(--char-accent);margin-bottom:1rem;">YOUR FICO SCORE</h2>

    <!-- Arc Gauge -->
    <div style="text-align:center;margin-bottom:1rem;">
      <svg width="200" height="110" viewBox="0 0 200 110">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#374151" stroke-width="14" stroke-linecap="round"/>
        <path id="gauge-arc" d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke="${tier.barColor}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
      </svg>
      <div class="orbitron" style="font-size:2.5rem;font-weight:700;color:${tier.color};margin-top:-0.5rem;">
        ${score || '—'}
      </div>
      <div style="color:${tier.color};font-weight:600;">${tier.label}</div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <div style="font-size:0.75rem;letter-spacing:0.1em;color:#6B7280;margin-bottom:0.75rem;">
        THE 5 FACTORS THAT BUILD YOUR SCORE
      </div>
      ${factorRows}
    </div>

    <div style="margin-bottom:1.25rem;">
      <div style="font-size:0.75rem;letter-spacing:0.1em;color:#6B7280;margin-bottom:0.75rem;">
        WHAT YOUR SCORE UNLOCKS
      </div>
      ${tierRows}
    </div>

    <div style="margin-bottom:1.25rem;font-size:0.85rem;color:#9CA3AF;font-style:italic;text-align:center;">
      ⚡ Building credit takes years. Damaging it takes one missed payment.
    </div>

    <div style="text-align:center;">
      <button class="choice-btn" id="modal-close-btn" style="min-width:160px;">GOT IT — CLOSE</button>
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

  // Animate factor bars in staggered
  setTimeout(() => {
    el.scoreModal.querySelectorAll('.modal-factor-fill').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = `${bar.dataset.pct}%`;
      }, i * 100);
    });

    // Animate gauge arc
    if (score) {
      const pct = (score - 300) / 550;
      const circ = 251.2;
      const arcEl = el.scoreModal.querySelector('#gauge-arc');
      if (arcEl) {
        arcEl.style.transition = 'stroke-dashoffset 600ms ease-out';
        arcEl.style.strokeDashoffset = `${circ * (1 - pct)}`;
      }
    }
  }, 300);

  // Attach tooltips
  if (_dict) attachTooltips(el.scoreModal, _dict);

  function closeModal() {
    el.modalOverlay.style.opacity = '0';
    el.scoreModal.style.opacity   = '0';
    el.scoreModal.style.transform = 'scale(0.85)';
    setTimeout(() => {
      el.modalOverlay.style.display = 'none';
    }, 220);
  }

  el.scoreModal.querySelector('#modal-close').addEventListener('click', closeModal);
  el.scoreModal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  el.modalOverlay.addEventListener('click', e => {
    if (e.target === el.modalOverlay) closeModal();
  });
}

/* ── Report Card ─────────────────────────────────────────────────────────────── */

function showReportCard() {
  const _src = sounds.gameOver();
  if (_src) {
    _src.onended = () => sounds.thanks();
  } else {
    sounds.stageComplete();
  }
  updateStageDots(4);

  const score = calculateFICOScore(gameState.credit);
  const tier  = getScoreTier(score);
  const subs  = getFactorSubScores(gameState.credit);
  const flags = gameState.flags;

  // Character-specific closing quip
  const closingBubble = (score && score >= 740)
    ? bubbles.reportPerfect[gameState.character]
    : bubbles.reportPoor[gameState.character];

  // Perfect payment history achievement
  const perfectBadgeHTML = flags.perfectPaymentHistory
    ? `<div class="achievement-badge">🏆 FLAWLESS PAYMENT HISTORY</div>`
    : '';

  if (flags.perfectPaymentHistory) sounds.stageCompletePerfect();

  // Factor bars
  const factorBars = FACTOR_META.map(m => {
    const pct = subs[m.key] || 0;
    return `
      <div style="margin-bottom:0.75rem;">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:3px;">
          <span style="color:#111827;font-weight:600;">${m.label}</span>
          <span style="color:#4B5563;">${m.pct} · ${pct}/100</span>
        </div>
        <div style="background:#374151;border-radius:4px;height:10px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444'};border-radius:4px;transition:width 800ms ease-out;"></div>
        </div>
      </div>
    `;
  }).join('');

  // Journey narrative from decisionsLog — grouped by life stage
  const STAGE_NAMES = { 1: 'High School (Ages 16–18)', 2: 'College Age (Ages 18–22)', 3: 'Young Adult (Ages 22–25)' };
  const journeyByStage = {};
  gameState.decisionsLog.forEach(d => {
    const s = d.stage || 1;
    if (!journeyByStage[s]) journeyByStage[s] = [];
    journeyByStage[s].push(d);
  });
  const journeyHTML = Object.keys(journeyByStage).sort().map(s => {
    const items = journeyByStage[s].map(d => {
      const sign = d.scoreEffect > 0 ? '+' : '';
      const effColor = d.scoreEffect > 0 ? '#16A34A' : d.scoreEffect < 0 ? '#DC2626' : '#4B5563';
      const eff = d.scoreEffect !== null
        ? `<span style="color:${effColor};font-weight:700;"> ${sign}${d.scoreEffect} pts</span>`
        : '';
      return `<li style="margin-bottom:0.4rem;color:#1F2937;">
        <span style="color:#111827;font-weight:600;">${d.scenarioTitle || d.scenarioId}</span>
        <span style="color:#4B5563;"> — ${d.choiceLabel}</span>${eff}
      </li>`;
    }).join('');
    return `
      <div style="margin-bottom:1rem;">
        <div style="font-size:0.7rem;letter-spacing:0.1em;color:#374151;font-weight:700;margin-bottom:0.4rem;text-transform:uppercase;">
          ${STAGE_NAMES[s] || `Stage ${s}`}
        </div>
        <ul style="padding-left:1.25rem;margin:0;line-height:1.8;font-size:0.875rem;">${items}</ul>
      </div>`;
  }).join('') || '<p style="color:#4B5563;">No decisions recorded.</p>';

  // FICO factors plain-language card
  const ficoFactorsHTML = [
    { icon: '💳', pct: '35%', name: 'Payment History',     plain: 'Do you pay your bills on time? Late payments hurt — a lot. This is the biggest factor.' },
    { icon: '📊', pct: '30%', name: 'Amounts Owed',        plain: 'How much of your available credit are you using? Keep your card balances below 30% of your limit.' },
    { icon: '📅', pct: '15%', name: 'Length of History',   plain: 'How long have you had credit? Older accounts help. Don\'t close your oldest card.' },
    { icon: '🔄', pct: '10%', name: 'Credit Mix',          plain: 'Do you have both credit cards and loans? A healthy mix of types shows you can manage different debt.' },
    { icon: '🔍', pct: '10%', name: 'New Credit',          plain: 'Have you applied for a lot of new credit recently? Each application leaves a hard inquiry on your report.' },
  ].map(f => `
    <div style="display:flex;gap:0.75rem;align-items:flex-start;margin-bottom:0.9rem;padding-bottom:0.9rem;border-bottom:1px solid #D1D5DB;">
      <span style="font-size:1.4rem;flex-shrink:0;">${f.icon}</span>
      <div>
        <div style="font-weight:700;color:#111827;font-size:0.9rem;">${f.name} <span style="color:var(--char-primary);font-size:0.8rem;font-weight:700;">(${f.pct})</span></div>
        <div style="color:#374151;font-size:0.85rem;line-height:1.5;margin-top:0.2rem;">${f.plain}</div>
      </div>
    </div>
  `).join('');

  setContent(`
    <div style="max-width:680px;margin:0 auto;">

      <!-- Header -->
      <div class="card" style="text-align:center;margin-bottom:1rem;">
        <div class="orbitron" style="font-size:0.75rem;letter-spacing:0.15em;color:#374151;margin-bottom:0.5rem;">
          FINAL REPORT CARD
        </div>
        <h1 class="orbitron" style="color:var(--char-accent);font-size:1.6rem;margin-bottom:0.5rem;">
          ${gameState.playerName}'s Credit Journey
        </h1>
        ${perfectBadgeHTML}

        <!-- Final Score -->
        <div style="margin:1.5rem 0;">
          <div class="orbitron" style="font-size:3.5rem;font-weight:700;color:${tier.color};" id="report-score">
            ${score || '—'}
          </div>
          <div style="font-size:1.1rem;color:${tier.color};font-weight:600;">${tier.label}</div>
        </div>

        <div class="card-bubble">${closingBubble}</div>

        <div style="display:flex;justify-content:center;gap:2rem;margin-top:1rem;font-size:0.9rem;">
          <div><span style="color:#4B5563;">Quiz Bonus</span><br><strong style="font-size:1.2rem;color:#111827;">${gameState.bonusPoints} / 30 pts</strong></div>
          <div><span style="color:#4B5563;">Decisions Made</span><br><strong style="font-size:1.2rem;color:#111827;">${gameState.decisionsLog.length}</strong></div>
          <div><span style="color:#4B5563;">Terms Learned</span><br><strong style="font-size:1.2rem;color:#111827;">${gameState.termsEncountered.size}</strong></div>
        </div>
      </div>

      <!-- Vocab Review (slot 2) -->
      <div class="card" style="margin-bottom:1rem;" id="vocab-section">
        <div style="font-size:0.75rem;letter-spacing:0.1em;color:#374151;font-weight:700;margin-bottom:1rem;">
          VOCABULARY YOU ENCOUNTERED
        </div>
        <button class="choice-btn" id="vocab-toggle-btn" style="font-size:0.85rem;margin-bottom:0.75rem;">
          SHOW TERMS (${gameState.termsEncountered.size})
        </button>
        <div id="vocab-list" style="display:none;"></div>
      </div>

      <!-- What is a credit score? (replaces outcomes card) -->
      <div class="card" style="margin-bottom:1rem;">
        <div style="font-size:0.75rem;letter-spacing:0.1em;color:#374151;font-weight:700;margin-bottom:1rem;">
          THE 5 FACTORS THAT BUILD YOUR SCORE
        </div>
        ${ficoFactorsHTML}
      </div>

      <!-- FICO Factor Breakdown -->
      <div class="card" style="margin-bottom:1rem;">
        <div style="font-size:0.75rem;letter-spacing:0.1em;color:#374151;font-weight:700;margin-bottom:1rem;">
          YOUR FICO FACTOR BREAKDOWN
        </div>
        ${factorBars}
      </div>

      <!-- Journey -->
      <div class="card" style="margin-bottom:1rem;">
        <div style="font-size:0.75rem;letter-spacing:0.1em;color:#374151;font-weight:700;margin-bottom:1rem;">
          YOUR JOURNEY
        </div>
        ${journeyHTML}
      </div>

      <!-- Play Again -->
      <div style="text-align:center;padding:1rem 0 2rem;">
        <button class="choice-btn" id="play-again-btn" style="font-size:1rem;min-width:200px;">
          PLAY AGAIN ↺
        </button>
      </div>

    </div>
  `);

  window.scrollTo(0, 0);
  spawnReportStars();

  // Stagger the report card sections
  el.container.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${i * 80}ms`;
  });

  // Vocab toggle
  const vocabBtn  = el.container.querySelector('#vocab-toggle-btn');
  const vocabList = el.container.querySelector('#vocab-list');
  vocabBtn.addEventListener('click', () => {
    if (vocabList.style.display === 'none') {
      // Build vocab list
      const entries = [...gameState.termsEncountered].map(key => {
        const entry = _dict?.[key];
        if (!entry) return '';
        return `<div style="margin-bottom:0.75rem;padding:0.5rem 0.75rem;background:#1a1a2e;border-radius:6px;">
          <strong style="color:var(--char-accent);">${entry.term_en}</strong>
          <p style="font-size:0.85rem;color:#D1D5DB;margin:0.25rem 0 0;">${entry.definition_en || ''}</p>
        </div>`;
      }).join('');
      vocabList.innerHTML = entries || '<p style="color:#374151;">No terms tracked.</p>';
      vocabList.style.display = 'block';
      vocabBtn.textContent = 'HIDE TERMS';
      if (_dict) attachTooltips(vocabList, _dict);
    } else {
      vocabList.style.display = 'none';
      vocabBtn.textContent = `SHOW TERMS (${gameState.termsEncountered.size})`;
    }
  });

  // Play Again
  el.container.querySelector('#play-again-btn').addEventListener('click', () => {
    sounds.click();
    resetGame();
  });
}

/* ── Reset Game ──────────────────────────────────────────────────────────────── */

function resetGame() {
  // Reset game state
  gameState.playerName   = '';
  gameState.character    = '';
  gameState.muted        = isMuted();
  gameState.currentStage = 0;
  gameState.scenariosCompleted = [];
  gameState.scenarioQueue      = [];
  gameState.scenarioIndex      = 0;
  gameState.decisionsLog       = [];
  gameState.credit             = makeCreditState();
  gameState.bonusPoints        = 0;
  gameState.quizDrawOrder      = [];
  gameState.quizAnswered       = [];
  gameState.flags = {
    usedAuthorizedUser: false, hadCollections: false, hadLatePayment: false,
    tookStudentLoans: false, closedOldestAccount: false, hadThinFile: false,
    perfectPaymentHistory: true, stage3ApartmentResult: null,
    stage3CarAPR: null, stage3JobResult: null, foundEasterEgg: false,
  };
  gameState.termsEncountered = new Set();

  el.body.className = '';
  el.playerNameEl.textContent = '';
  el.charName.textContent     = '';
  el.charAvatar.innerHTML = '⭐';
  updateScoreDisplay(null, null);
  updateStageDots(0);

  showCharacterSelect();
}

/* ── Mute Toggle ─────────────────────────────────────────────────────────────── */

function initMuteToggle() {
  if (!el.muteBtn) return;
  el.muteBtn.addEventListener('click', () => {
    const nowMuted = !isMuted();
    setMuted(nowMuted);
    gameState.muted = nowMuted;
    el.muteBtn.textContent = nowMuted ? '🔇' : '🔊';
    el.muteBtn.title       = nowMuted ? 'Unmute' : 'Mute';
  });
}

/* ── Score Display Click → Modal ─────────────────────────────────────────────── */

function initScoreClick() {
  if (!el.scoreDisplay) return;
  el.scoreDisplay.addEventListener('click', () => {
    if (gameState.currentStage > 0) openScoreModal();
  });
}

/* ── App Init ─────────────────────────────────────────────────────────────────── */

async function init() {
  // Load dictionary first (non-blocking for UI)
  _dict = await loadDictionary();

  initMuteToggle();
  initScoreClick();

  // Easter eggs need game state — init after state exists
  // (called after character is selected to avoid null character)

  showCharacterSelect();
}

// Kick off
init();
