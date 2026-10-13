import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeCreditState, calculateFICOScore, applyEffects, applyStageTransition,
  getUtilization, getFactorSubScores, getScoreTier, describeScoreChange,
} from '../scripts/engine/scoring.js';

const withCard = () => {
  const s = makeCreditState();
  applyEffects({
    hasAnyCredit: true,
    creditMix: { hasRevolvingCredit: true },
    amountsOwed: { limitDelta: 1000, balanceDelta: 0 },
    lengthHistory: { delta: 15 },
    newCredit: { hardInquiries: 1 },
  }, s, {});
  return s;
};

test('no credit means no score', () => {
  assert.equal(calculateFICOScore(makeCreditState()), null);
});

test('score stays within 300–850', () => {
  const s = withCard();
  applyEffects({ paymentHistory: { delta: -500 }, amountsOwed: { balanceDelta: 5000 } }, s, {});
  assert.ok(calculateFICOScore(s) >= 300);
  s.quizBonus = 500;
  assert.equal(calculateFICOScore(s), 850);
});

test('installment loans do not count toward card utilization', () => {
  const s = withCard();
  const before = calculateFICOScore(s);
  applyEffects({ creditMix: { hasInstallmentLoan: true }, installment: { balanceDelta: 180000 } }, s, {});
  assert.equal(getUtilization(s), 0);
  assert.equal(s.installment.totalBalance, 180000);
  assert.ok(calculateFICOScore(s) > before, 'adding a loan improves mix without hurting utilization');
});

test('high utilization lowers the Amounts Owed factor', () => {
  const s = withCard();
  applyEffects({ amountsOwed: { balanceDelta: 900 } }, s, {});
  assert.equal(getFactorSubScores(s).amountsOwed, 5);
});

test('closing a card removes its limit and caps the balance', () => {
  const s = withCard();
  applyEffects({ amountsOwed: { balanceDelta: 200, limitClose: 1000 } }, s, {});
  assert.equal(s.amountsOwed.totalLimit, 0);
  assert.equal(s.amountsOwed.totalBalance, 0);
});

test('stage transition ages accounts and lets an inquiry age off', () => {
  const s = withCard();
  applyEffects({ newCredit: { hardInquiries: 2 } }, s, {});
  const before = getFactorSubScores(s);
  applyStageTransition(s);
  const after = getFactorSubScores(s);
  assert.equal(s.newCredit.hardInquiries, 2);
  assert.ok(after.newCredit > before.newCredit, 'inquiry recovery shows up in the score');
  assert.equal(after.lengthHistory, before.lengthHistory + 20);
});

test('stage transition does nothing without credit', () => {
  const s = makeCreditState();
  applyStageTransition(s);
  assert.deepEqual(s, makeCreditState());
});

test('collections count and removal', () => {
  const s = withCard();
  applyEffects({ paymentHistory: { delta: -60, collections: 1 } }, s, {});
  assert.equal(s.paymentHistory.collections, 1);
  applyEffects({ paymentHistory: { delta: 30, removeCollection: true } }, s, {});
  assert.equal(s.paymentHistory.collections, 0);
});

test('flags merge into the flags object', () => {
  const flags = { a: 1 };
  applyEffects({ flags: { b: 2 } }, makeCreditState(), flags);
  assert.deepEqual(flags, { a: 1, b: 2 });
});

test('score tiers at boundaries', () => {
  assert.equal(getScoreTier(null).label, 'No Score Yet');
  assert.equal(getScoreTier(579).label, 'Poor');
  assert.equal(getScoreTier(580).label, 'Fair');
  assert.equal(getScoreTier(739).label, 'Good');
  assert.equal(getScoreTier(740).label, 'Very Good');
  assert.equal(getScoreTier(850).label, 'Exceptional');
});

test('describeScoreChange', () => {
  assert.equal(describeScoreChange(null, 650).label, 'Score started: 650');
  assert.equal(describeScoreChange(650, 640).label, '-10 pts');
  assert.equal(describeScoreChange(640, 650).css, 'up');
  assert.equal(describeScoreChange(650, 650).label, 'No change');
});
