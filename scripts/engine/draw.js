/* ── Credit Quest: Scenario + Quiz Selection ────────────────────────────────── */
/* Pure functions, no DOM.                                                       */

import { fisherYates } from '../utils.js';
import { quizBank } from '../data/quiz.js';
import { QUIZ_PER_BRIDGE } from '../config.js';

/* Named preconditions a scenario can list in `requires: [...]`.
   Add a new entry here to gate scenarios on any game state. */
export const REQUIREMENTS = {
  revolvingCredit: gs => gs.credit.creditMix.hasRevolvingCredit,
  studentLoans:    gs => gs.flags.tookStudentLoans,
  collections:     gs => gs.flags.hadCollections,
};

export function isEligible(scenario, gs) {
  return (scenario.requires || []).every(req => REQUIREMENTS[req](gs));
}

/* Draw the next scenario from a stage pool. Evaluated lazily (one at a time)
   so earlier choices in the same stage decide what can come next.
   Returns null when nothing eligible is left. */
export function drawNextScenario(pool, shownIds, gs) {
  const remaining = pool.filter(s => !shownIds.includes(s.id));
  const forced = remaining.find(s => s.alwaysFirst);
  if (forced) return forced;
  const eligible = remaining.filter(s => isEligible(s, gs));
  return eligible.length ? fisherYates(eligible)[0] : null;
}

/* Shuffled indices into quizBank, drawn once per game */
export function initQuizDrawOrder() {
  return fisherYates([...quizBank.keys()]);
}

/* Questions for a bridge (bridge 1 follows stage 1, bridge 2 follows stage 2) */
export function getQuizBatch(drawOrder, bridgeNumber) {
  const start = (bridgeNumber - 1) * QUIZ_PER_BRIDGE;
  return drawOrder.slice(start, start + QUIZ_PER_BRIDGE).map(idx => quizBank[idx]);
}
