/* Guards against content mistakes when scenarios or quiz questions are added. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stage1Pool, stage2Pool, stage3Pool } from '../scripts/data/scenarios.js';
import { quizBank } from '../scripts/data/quiz.js';
import { CHARACTERS } from '../scripts/data/characters.js';
import { REQUIREMENTS, isEligible } from '../scripts/engine/draw.js';
import { createGameState } from '../scripts/state.js';
import { bubbleTriggers } from '../scripts/ui/bubbles.js';
import { TERM_ALIASES } from '../scripts/ui/tooltip.js';
import { SCENARIOS_PER_STAGE, QUIZ_PER_BRIDGE, QUIZ_BRIDGES } from '../scripts/config.js';

const pools = { 1: stage1Pool, 2: stage2Pool, 3: stage3Pool };
const allScenarios = [...stage1Pool, ...stage2Pool, ...stage3Pool];
const characters = Object.keys(CHARACTERS);
const dictionary = new Set(JSON.parse(fs.readFileSync(new URL('../data/pf_dictionary.json', import.meta.url))).map(e => e.id));

const EFFECT_KEYS = {
  hasAnyCredit: null,
  paymentHistory: ['delta', 'onTimePayments', 'latePayments30', 'latePayments60', 'defaults', 'collections', 'removeCollection'],
  amountsOwed:    ['limitDelta', 'balanceDelta', 'balanceClear', 'limitClose'],
  installment:    ['balanceDelta'],
  lengthHistory:  ['delta'],
  creditMix:      ['hasRevolvingCredit', 'hasInstallmentLoan', 'hasMortgage'],
  newCredit:      ['hardInquiries'],
  flags:          null,
};

test('scenario ids are unique and match their stage', () => {
  const ids = allScenarios.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const [stage, pool] of Object.entries(pools)) {
    for (const s of pool) assert.equal(s.stage, Number(stage), s.id);
  }
});

test('every scenario has the fields the screens need', () => {
  for (const s of allScenarios) {
    for (const f of ['id', 'title', 'setting', 'narrative']) assert.ok(s[f], `${s.id} missing ${f}`);
    if (s.type === 'consequence-event') {
      assert.ok(s.outcomesByScore.some(o => o.minScore === 0), `${s.id} needs a minScore 0 fallback`);
      for (const o of s.outcomesByScore) assert.ok(o.title && o.text && o.emoji, `${s.id} outcome incomplete`);
    } else {
      assert.ok(s.choices.length >= 2 && s.choices.length <= 4, `${s.id} choice count`);
      for (const c of s.choices) {
        assert.ok(c.label && c.consequenceTitle && c.consequenceText, `${s.id} choice incomplete`);
      }
    }
  }
});

test('choice effects only use keys the scoring engine understands', () => {
  for (const s of allScenarios) {
    for (const c of s.choices || []) {
      for (const [key, val] of Object.entries(c.effects || {})) {
        assert.ok(key in EFFECT_KEYS, `${s.id}: unknown effect "${key}"`);
        if (EFFECT_KEYS[key]) {
          for (const sub of Object.keys(val)) assert.ok(EFFECT_KEYS[key].includes(sub), `${s.id}: unknown ${key}.${sub}`);
        }
      }
    }
  }
});

test('requirements reference known predicates', () => {
  for (const s of allScenarios) {
    for (const r of s.requires || []) assert.ok(r in REQUIREMENTS, `${s.id}: unknown requirement "${r}"`);
  }
});

test('a player with no credit still gets a full stage', () => {
  const gs = createGameState();
  for (const [stage, pool] of Object.entries(pools)) {
    const eligible = pool.filter(s => isEligible(s, gs));
    assert.ok(eligible.length >= SCENARIOS_PER_STAGE, `stage ${stage} has only ${eligible.length} ungated scenarios`);
  }
});

test('character text exists for every character', () => {
  for (const s of allScenarios) {
    const sets = [s.characterBubble, ...(s.choices || []).map(c => c.consequenceBubble)].filter(Boolean);
    for (const set of sets) for (const ch of characters) assert.ok(set[ch], `${s.id}: no ${ch} line`);
  }
});

test('bubble events on choices exist', () => {
  for (const s of allScenarios) {
    for (const c of s.choices || []) {
      if (c.bubble) assert.ok(c.bubble in bubbleTriggers, `${s.id}: unknown bubble "${c.bubble}"`);
    }
  }
});

test('every tooltip term is in the dictionary', () => {
  const missing = new Set();
  for (const s of allScenarios) {
    for (const [, raw] of s.narrative.matchAll(/data-term="([^"]+)"/g)) {
      const norm = raw.replace(/-/g, '_').toLowerCase();
      const key = TERM_ALIASES[norm] || norm;
      if (!dictionary.has(key)) missing.add(`${s.id}:${raw}`);
    }
  }
  assert.deepEqual([...missing], []);
});

test('quiz bank is valid and large enough', () => {
  assert.ok(quizBank.length >= QUIZ_PER_BRIDGE * QUIZ_BRIDGES);
  assert.equal(new Set(quizBank.map(q => q.id)).size, quizBank.length);
  for (const q of quizBank) {
    assert.deepEqual(Object.keys(q.choices), ['A', 'B', 'C', 'D'], q.id);
    assert.ok(q.answer in q.choices, q.id);
    assert.ok(q.explanation, q.id);
  }
});
