/* ── Credit Quest: Run Summary ──────────────────────────────────────────────── */
/* A plain, serializable record of one playthrough — the shape a scoreboard     */
/* or leaderboard would store.                                                  */

import { calculateFICOScore, getScoreTier } from './scoring.js';

export function buildRunSummary(gs) {
  const score = calculateFICOScore(gs.credit);
  return {
    playerName:   gs.playerName,
    character:    gs.character,
    finalScore:   score,
    tier:         getScoreTier(score).label,
    quizCorrect:  gs.quizCorrect,
    quizBonus:    gs.credit.quizBonus,
    decisions:    gs.decisionsLog.map(d => ({ id: d.scenarioId, choice: d.choiceIndex, effect: d.scoreEffect })),
    perfectPaymentHistory: gs.flags.perfectPaymentHistory,
    termsLearned: gs.termsEncountered.size,
    finishedAt:   new Date().toISOString(),
  };
}
