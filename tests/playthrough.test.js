/* Simulates many random playthroughs of the engine (no DOM). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stage1Pool, stage2Pool, stage3Pool } from '../scripts/data/scenarios.js';
import { calculateFICOScore, applyEffects, applyStageTransition } from '../scripts/engine/scoring.js';
import { drawNextScenario, isEligible, initQuizDrawOrder, getQuizBatch } from '../scripts/engine/draw.js';
import { createGameState } from '../scripts/state.js';
import { SCENARIOS_PER_STAGE, STAGE_COUNT, QUIZ_BRIDGES } from '../scripts/config.js';

const pools = [stage1Pool, stage2Pool, stage3Pool];

function play(pickChoice) {
  const gs = createGameState();
  for (let stage = 1; stage <= STAGE_COUNT; stage++) {
    if (stage > 1) applyStageTransition(gs.credit);
    const shown = [];
    while (shown.length < SCENARIOS_PER_STAGE) {
      const s = drawNextScenario(pools[stage - 1], shown, gs);
      if (!s) break;
      assert.ok(isEligible(s, gs), `${s.id} drawn while ineligible`);
      shown.push(s.id);
      if (s.choices) {
        const i = pickChoice(s);
        applyEffects(s.choices[i].effects, gs.credit, gs.flags);
        gs.decisionsLog.push({ scenarioId: s.id, choiceIndex: i });
      }
    }
    assert.equal(shown.length, SCENARIOS_PER_STAGE, `stage ${stage} ended early`);
    if (stage === 1) assert.equal(shown[0], 's1-01');
    if (stage === 3) assert.equal(shown[0], 's3-01');
  }
  return gs;
}

test('random playthroughs stay valid', () => {
  for (let i = 0; i < 500; i++) {
    const gs = play(s => Math.floor(Math.random() * s.choices.length));
    const score = calculateFICOScore(gs.credit);
    assert.ok(score === null || (score >= 300 && score <= 850), `score ${score}`);
  }
});

test('a player who declines everything gets full stages and no score', () => {
  for (let i = 0; i < 50; i++) {
    // Last choice is the "decline / do nothing" option in every opt-in scenario
    const gs = play(s => s.choices.length - 1);
    assert.equal(calculateFICOScore(gs.credit), null);
  }
});

test('careful play beats reckless play', () => {
  const avg = (pick) => {
    let total = 0;
    for (let i = 0; i < 200; i++) total += calculateFICOScore(play(pick).credit) ?? 300;
    return total / 200;
  };
  const careful  = avg(s => 0);                     // first option is usually the responsible one
  const reckless = avg(s => s.choices.length > 2 ? 1 : 0);
  assert.ok(careful > 700, `careful average ${careful}`);
  assert.ok(careful >= reckless, `careful ${careful} vs reckless ${reckless}`);
});

test('quiz batches never repeat a question', () => {
  const order = initQuizDrawOrder();
  const ids = [];
  for (let b = 1; b <= QUIZ_BRIDGES; b++) ids.push(...getQuizBatch(order, b).map(q => q.id));
  assert.equal(new Set(ids).size, ids.length);
});
