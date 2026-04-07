/* ── Credit Quest: FICO Scoring Engine ──────────────────────────────────────── */
/* scoring.js — self-contained, testable in isolation                            */

'use strict';

/* ── Initial State Template ───────────────────────────────────────────────────── */
function makeCreditState() {
  return {
    hasAnyCredit: false,

    paymentHistory: {        // Weight: 35%
      onTimePayments: 0,
      latePayments30: 0,
      latePayments60: 0,
      defaults:       0,
      collections:    0,
      subScore:       100   // starts perfect, degrades on misses
    },

    amountsOwed: {           // Weight: 30%
      totalLimit:   0,
      totalBalance: 0,
      utilization:  0,
      subScore:     100     // auto-derived from utilization
    },

    lengthHistory: {         // Weight: 15%
      monthsOldestAccount: 0,
      subScore:            0 // starts 0 — earned by opening accounts
    },

    creditMix: {             // Weight: 10%
      hasRevolvingCredit:  false,
      hasInstallmentLoan:  false,
      hasMortgage:         false,
      subScore:            0  // auto-derived from flags
    },

    newCredit: {             // Weight: 10%
      hardInquiries:  0,
      subScore:       100   // decreases per inquiry, recovers per stage
    },

    quizBonus: 0             // Flat bonus points from correct Knowledge Check answers
  };
}

/* ── Sub-score Derivation Helpers ─────────────────────────────────────────────── */

function getUtilizationSubScore(utilization) {
  if (utilization <= 0)    return 100;
  if (utilization < 0.10)  return 95;
  if (utilization < 0.30)  return 85;
  if (utilization < 0.50)  return 70;
  if (utilization < 0.75)  return 45;
  if (utilization < 0.90)  return 20;
  if (utilization <= 1.0)  return 5;
  return 0; // over limit
}

function getCreditMixSubScore(mix) {
  if (mix.hasMortgage && (mix.hasRevolvingCredit || mix.hasInstallmentLoan)) return 100;
  if (mix.hasRevolvingCredit && mix.hasInstallmentLoan) return 80;
  if (mix.hasRevolvingCredit || mix.hasInstallmentLoan) return 40;
  return 0;
}

function getNewCreditSubScore(inquiries) {
  if (inquiries <= 0) return 100;
  if (inquiries === 1) return 90;
  if (inquiries === 2) return 80;
  if (inquiries === 3) return 65;
  return 50; // 4+
}

/* ── Main Score Calculation ───────────────────────────────────────────────────── */

function calculateFICOScore(state) {
  if (!state.hasAnyCredit) return null; // "No Score Yet"

  // Derive dynamic sub-scores
  const util = state.amountsOwed.totalLimit > 0
    ? state.amountsOwed.totalBalance / state.amountsOwed.totalLimit
    : 0;
  const amountsSubScore  = getUtilizationSubScore(util);
  const mixSubScore      = getCreditMixSubScore(state.creditMix);
  const newCreditSubScore = getNewCreditSubScore(state.newCredit.hardInquiries);

  const weighted =
    (state.paymentHistory.subScore * 0.35) +
    (amountsSubScore               * 0.30) +
    (state.lengthHistory.subScore  * 0.15) +
    (mixSubScore                   * 0.10) +
    (newCreditSubScore             * 0.10);

  const base = Math.round(300 + (weighted / 100) * 550);
  return Math.min(850, base + (state.quizBonus || 0));
}

/* ── Score Tier ───────────────────────────────────────────────────────────────── */

function getScoreTier(score) {
  if (!score)       return { label: 'No Score Yet',  color: '#6B7280', barColor: '#374151', tierPct: 0 };
  if (score < 580)  return { label: 'Poor',          color: '#DC2626', barColor: '#FCA5A5', tierPct: (score - 300) / 280 };
  if (score < 670)  return { label: 'Fair',          color: '#F97316', barColor: '#FED7AA', tierPct: (score - 300) / 370 };
  if (score < 740)  return { label: 'Good',          color: '#CA8A04', barColor: '#FDE68A', tierPct: (score - 300) / 440 };
  if (score < 800)  return { label: 'Very Good',     color: '#16A34A', barColor: '#BBF7D0', tierPct: (score - 300) / 500 };
  return              { label: 'Exceptional',        color: '#7C3AED', barColor: '#DDD6FE', tierPct: (score - 300) / 550 };
}

/* ── Apply Effects from Scenario Choice ──────────────────────────────────────── */

function applyEffects(effects, state, flags) {
  if (!effects) return;

  // hasAnyCredit flag
  if (effects.hasAnyCredit === true) state.hasAnyCredit = true;

  // Payment History
  if (effects.paymentHistory) {
    const ph = effects.paymentHistory;
    if (ph.delta !== undefined) {
      state.paymentHistory.subScore = Math.max(0, Math.min(100,
        state.paymentHistory.subScore + ph.delta));
    }
    if (ph.onTimePayments) state.paymentHistory.onTimePayments += ph.onTimePayments;
    if (ph.latePayments30) state.paymentHistory.latePayments30 += ph.latePayments30;
    if (ph.latePayments60) state.paymentHistory.latePayments60 += ph.latePayments60;
    if (ph.defaults)       state.paymentHistory.defaults       += ph.defaults;
    if (ph.collections)    state.paymentHistory.collections    += ph.collections;
    if (ph.removeCollection && state.paymentHistory.collections > 0) {
      state.paymentHistory.collections--;
    }
  }

  // Amounts Owed
  if (effects.amountsOwed) {
    const ao = effects.amountsOwed;
    if (ao.limitDelta !== undefined)  state.amountsOwed.totalLimit   += ao.limitDelta;
    if (ao.balanceDelta !== undefined) state.amountsOwed.totalBalance += ao.balanceDelta;
    if (ao.balanceClear)              state.amountsOwed.totalBalance  = 0;
    if (ao.limitClose !== undefined)  {
      state.amountsOwed.totalLimit  = Math.max(0, state.amountsOwed.totalLimit  - ao.limitClose);
      state.amountsOwed.totalBalance = Math.max(0, Math.min(
        state.amountsOwed.totalBalance, state.amountsOwed.totalLimit));
    }
    // Clamp
    state.amountsOwed.totalBalance = Math.max(0, state.amountsOwed.totalBalance);
    state.amountsOwed.totalLimit   = Math.max(0, state.amountsOwed.totalLimit);
    // Recalculate utilization
    state.amountsOwed.utilization = state.amountsOwed.totalLimit > 0
      ? state.amountsOwed.totalBalance / state.amountsOwed.totalLimit
      : 0;
    state.amountsOwed.subScore = getUtilizationSubScore(state.amountsOwed.utilization);
  }

  // Length of History
  if (effects.lengthHistory) {
    const lh = effects.lengthHistory;
    if (lh.delta !== undefined) {
      state.lengthHistory.subScore = Math.max(0, Math.min(100,
        state.lengthHistory.subScore + lh.delta));
    }
    if (lh.monthsOldestAccount !== undefined)
      state.lengthHistory.monthsOldestAccount = lh.monthsOldestAccount;
  }

  // Credit Mix
  if (effects.creditMix) {
    const cm = effects.creditMix;
    if (cm.hasRevolvingCredit !== undefined) state.creditMix.hasRevolvingCredit = cm.hasRevolvingCredit;
    if (cm.hasInstallmentLoan !== undefined) state.creditMix.hasInstallmentLoan = cm.hasInstallmentLoan;
    if (cm.hasMortgage !== undefined)        state.creditMix.hasMortgage        = cm.hasMortgage;
    state.creditMix.subScore = getCreditMixSubScore(state.creditMix);
  }

  // New Credit (hard inquiries)
  if (effects.newCredit) {
    const nc = effects.newCredit;
    if (nc.hardInquiries !== undefined) {
      state.newCredit.hardInquiries += nc.hardInquiries;
    }
    state.newCredit.subScore = getNewCreditSubScore(state.newCredit.hardInquiries);
  }

  // Game flags
  if (effects.flags && flags) {
    Object.assign(flags, effects.flags);
  }
}

/* ── Stage Transition Effects ─────────────────────────────────────────────────── */
/* Called when moving from one stage to the next                                  */

function applyStageTransition(state) {
  if (!state.hasAnyCredit) return;

  // Length of history grows with time (each stage = more history)
  state.lengthHistory.subScore = Math.min(100, state.lengthHistory.subScore + 20);

  // Hard inquiry recovery — one stage without inquiries = +10
  // (We apply it regardless here since we don't track "this stage inquiries" separately)
  state.newCredit.subScore = Math.min(100, state.newCredit.subScore + 10);
  // Re-derive inquiries count to stay in sync
  // (inquiries count doesn't change, subScore gets a recovery nudge)
}

/* ── Describe Score Change (for consequence card) ─────────────────────────────── */

function describeScoreChange(oldScore, newScore) {
  if (oldScore === null && newScore === null) return { delta: 0, label: 'No Score', css: 'neutral' };
  if (oldScore === null && newScore !== null) return { delta: newScore, label: `Score started: ${newScore}`, css: 'up' };
  if (!newScore) return { delta: 0, label: 'No Score', css: 'neutral' };
  const delta = newScore - oldScore;
  if (delta === 0) return { delta: 0, label: 'No change', css: 'neutral' };
  const sign = delta > 0 ? '+' : '';
  return {
    delta,
    label: `${sign}${delta} pts`,
    css: delta > 0 ? 'up' : 'down'
  };
}

/* ── Factor Labels (for display) ─────────────────────────────────────────────── */

const FACTOR_META = [
  { key: 'paymentHistory', label: 'Payment History', pct: '35%', priority: true,  icon: '🔴' },
  { key: 'amountsOwed',    label: 'Amounts Owed',    pct: '30%', priority: true,  icon: '🔴' },
  { key: 'lengthHistory',  label: 'Length of History',pct: '15%', priority: false, icon: '⚪' },
  { key: 'creditMix',      label: 'Credit Mix',       pct: '10%', priority: false, icon: '⚪' },
  { key: 'newCredit',      label: 'New Credit',        pct: '10%', priority: false, icon: '⚪' },
];

function getFactorSubScores(state) {
  const util = state.amountsOwed.totalLimit > 0
    ? state.amountsOwed.totalBalance / state.amountsOwed.totalLimit : 0;
  return {
    paymentHistory: state.paymentHistory.subScore,
    amountsOwed:    getUtilizationSubScore(util),
    lengthHistory:  state.lengthHistory.subScore,
    creditMix:      getCreditMixSubScore(state.creditMix),
    newCredit:      getNewCreditSubScore(state.newCredit.hardInquiries)
  };
}
