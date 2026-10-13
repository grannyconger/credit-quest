/* ── Credit Quest: Game Event Bus ───────────────────────────────────────────── */
/* Lets new features (scoreboard, achievements, analytics) observe gameplay     */
/* without editing the screens. Events emitted:                                 */
/*   game:start   { playerName, character }                                     */
/*   stage:begin  { stage, score }                                              */
/*   choice       { scenarioId, choiceIndex, oldScore, newScore }               */
/*   quiz:answer  { questionId, correct, score }                                */
/*   game:end     { summary }  — see buildRunSummary() in engine/summary.js     */

const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}

export function emit(event, payload) {
  for (const fn of listeners.get(event) || []) {
    try { fn(payload); } catch (e) { console.error(`[events] ${event} listener failed`, e); }
  }
}
