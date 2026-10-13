/* ── Credit Quest: FICO Scoring Engine ──────────────────────────────────────── */
/* Pure functions, no DOM — runs in the browser and under `node --test`.         */
/*                                                                               */
/* Only raw facts live in state. Anything derivable (utilization, mix score,     */
/* inquiry score) is computed on demand, so it can never drift out of sync.      */

/* ── Initial State Template ───────────────────────────────────────────────────── */
export function makeCreditState() {
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

    amountsOwed: {           // Weight: 30% — revolving (credit card) accounts only
      totalLimit:   0,
      totalBalance: 0,
    },

    installment: {           // Loans: reported, but not part of card utilization
      totalBalance: 0,
    },

    lengthHistory: {         // Weight: 15%
      subScore: 0            // starts 0 — earned by opening accounts and time passing
    },

    creditMix: {             // Weight: 10%
      hasRevolvingCredit:  false,
      hasInstallmentLoan:  false,
      hasMortgage:         false,
    },

    newCredit: {             // Weight: 10%
      hardInquiries: 0,      // recent inquiries; one ages off per stage
    },

    quizBonus: 0             // Flat bonus points from correct Knowledge Check answers
  };
}

/* ── Sub-score Derivation Helpers ─────────────────────────────────────────────── */

export function getUtilization(state) {
  const { totalLimit, totalBalance } = state.amountsOwed;
  return totalLimit > 0 ? totalBalance / totalLimit : 0;
}

export function getUtilizationSubScore(utilization) {
  if (utilization <= 0)    return 100;
  if (utilization < 0.10)  return 95;
  if (utilization < 0.30)  return 85;
  if (utilization < 0.50)  return 70;
  if (utilization < 0.75)  return 45;
  if (utilization < 0.90)  return 20;
  if (utilization <= 1.0)  return 5;
  return 0; // over limit
}

export function getCreditMixSubScore(mix) {
  if (mix.hasMortgage && (mix.hasRevolvingCredit || mix.hasInstallmentLoan)) return 100;
  if (mix.hasRevolvingCredit && mix.hasInstallmentLoan) return 80;
  if (mix.hasRevolvingCredit || mix.hasInstallmentLoan || mix.hasMortgage) return 40;
  return 0;
}

export function getNewCreditSubScore(inquiries) {
  if (inquiries <= 0) return 100;
  if (inquiries === 1) return 90;
  if (inquiries === 2) return 80;
  if (inquiries === 3) return 65;
  return 50; // 4+
}

export function getFactorSubScores(state) {
  return {
    paymentHistory: state.paymentHistory.subScore,
    amountsOwed:    getUtilizationSubScore(getUtilization(state)),
    lengthHistory:  state.lengthHistory.subScore,
    creditMix:      getCreditMixSubScore(state.creditMix),
    newCredit:      getNewCreditSubScore(state.newCredit.hardInquiries)
  };
}

/* ── Main Score Calculation ───────────────────────────────────────────────────── */

export const FACTOR_WEIGHTS = {
  paymentHistory: 0.35,
  amountsOwed:    0.30,
  lengthHistory:  0.15,
  creditMix:      0.10,
  newCredit:      0.10,
};

export function calculateFICOScore(state) {
  if (!state.hasAnyCredit) return null; // "No Score Yet"

  const subs = getFactorSubScores(state);
  const weighted = Object.entries(FACTOR_WEIGHTS)
    .reduce((sum, [key, weight]) => sum + subs[key] * weight, 0);

  const base = Math.round(300 + (weighted / 100) * 550);
  return Math.min(850, base + (state.quizBonus || 0));
}

/* ── Score Tier ───────────────────────────────────────────────────────────────── */

export const SCORE_TIERS = [
  { label: 'Poor',        min: 300, max: 579, color: '#DC2626', barColor: '#FCA5A5' },
  { label: 'Fair',        min: 580, max: 669, color: '#F97316', barColor: '#FED7AA' },
  { label: 'Good',        min: 670, max: 739, color: '#CA8A04', barColor: '#FDE68A' },
  { label: 'Very Good',   min: 740, max: 799, color: '#16A34A', barColor: '#BBF7D0' },
  { label: 'Exceptional', min: 800, max: 850, color: '#7C3AED', barColor: '#DDD6FE' },
];

const NO_SCORE_TIER = { label: 'No Score Yet', color: '#6B7280', barColor: '#374151' };

export function getScoreTier(score) {
  if (!score) return NO_SCORE_TIER;
  return SCORE_TIERS.find(t => score <= t.max) || SCORE_TIERS[SCORE_TIERS.length - 1];
}

/* ── Apply Effects from Scenario Choice ──────────────────────────────────────── */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function applyEffects(effects, state, flags) {
  if (!effects) return;

  if (effects.hasAnyCredit === true) state.hasAnyCredit = true;

  // Payment History
  if (effects.paymentHistory) {
    const ph = effects.paymentHistory;
    if (ph.delta !== undefined) {
      state.paymentHistory.subScore = clamp(state.paymentHistory.subScore + ph.delta, 0, 100);
    }
    for (const key of ['onTimePayments', 'latePayments30', 'latePayments60', 'defaults', 'collections']) {
      if (ph[key]) state.paymentHistory[key] += ph[key];
    }
    if (ph.removeCollection && state.paymentHistory.collections > 0) {
      state.paymentHistory.collections--;
    }
  }

  // Amounts Owed (revolving)
  if (effects.amountsOwed) {
    const ao = effects.amountsOwed;
    const owed = state.amountsOwed;
    if (ao.limitDelta !== undefined)   owed.totalLimit   += ao.limitDelta;
    if (ao.balanceDelta !== undefined) owed.totalBalance += ao.balanceDelta;
    if (ao.balanceClear)               owed.totalBalance  = 0;
    if (ao.limitClose !== undefined) {
      owed.totalLimit   = Math.max(0, owed.totalLimit - ao.limitClose);
      owed.totalBalance = Math.min(owed.totalBalance, owed.totalLimit);
    }
    owed.totalBalance = Math.max(0, owed.totalBalance);
    owed.totalLimit   = Math.max(0, owed.totalLimit);
  }

  // Installment loans
  if (effects.installment) {
    const inst = effects.installment;
    if (inst.balanceDelta !== undefined) {
      state.installment.totalBalance = Math.max(0, state.installment.totalBalance + inst.balanceDelta);
    }
  }

  // Length of History
  if (effects.lengthHistory?.delta !== undefined) {
    state.lengthHistory.subScore = clamp(state.lengthHistory.subScore + effects.lengthHistory.delta, 0, 100);
  }

  // Credit Mix
  if (effects.creditMix) {
    for (const key of ['hasRevolvingCredit', 'hasInstallmentLoan', 'hasMortgage']) {
      if (effects.creditMix[key] !== undefined) state.creditMix[key] = effects.creditMix[key];
    }
  }

  // New Credit (hard inquiries)
  if (effects.newCredit?.hardInquiries !== undefined) {
    state.newCredit.hardInquiries += effects.newCredit.hardInquiries;
  }

  // Game flags
  if (effects.flags && flags) Object.assign(flags, effects.flags);
}

/* ── Stage Transition Effects ─────────────────────────────────────────────────── */
/* Each stage represents years passing.                                           */

export function applyStageTransition(state) {
  if (!state.hasAnyCredit) return;

  // Accounts age
  state.lengthHistory.subScore = Math.min(100, state.lengthHistory.subScore + 20);

  // Hard inquiries stop counting after ~12 months; one ages off per stage
  state.newCredit.hardInquiries = Math.max(0, state.newCredit.hardInquiries - 1);
}

/* ── Describe Score Change (for consequence card) ─────────────────────────────── */

export function describeScoreChange(oldScore, newScore) {
  if (newScore === null) return { delta: 0, label: 'No Score', css: 'neutral' };
  if (oldScore === null) return { delta: newScore, label: `Score started: ${newScore}`, css: 'up' };
  const delta = newScore - oldScore;
  if (delta === 0) return { delta: 0, label: 'No change', css: 'neutral' };
  return {
    delta,
    label: `${delta > 0 ? '+' : ''}${delta} pts`,
    css: delta > 0 ? 'up' : 'down'
  };
}

/* ── Factor Labels (for display) ─────────────────────────────────────────────── */

export const FACTOR_META = [
  { key: 'paymentHistory', label: 'Payment History',   pct: '35%', priority: true  },
  { key: 'amountsOwed',    label: 'Amounts Owed',      pct: '30%', priority: true  },
  { key: 'lengthHistory',  label: 'Length of History', pct: '15%', priority: false },
  { key: 'creditMix',      label: 'Credit Mix',        pct: '10%', priority: false },
  { key: 'newCredit',      label: 'New Credit',        pct: '10%', priority: false },
];

/* Bar color class for a 0–100 sub-score */
export function factorClass(pct) {
  return pct >= 70 ? 'good' : pct >= 40 ? 'fair' : 'poor';
}
