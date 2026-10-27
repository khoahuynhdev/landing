import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PACKAGES, RATES, RETAINERS, calculate, decodeState, encodeState, formatVnd, formatWeeks, normalizeState, summaryText,
} from '../claude-pricing-core.js';

const amounts = (payments) => payments.map((payment) => payment.amount);

test('package prices follow hours x 500,000 x contingency from the pricing model', () => {
  const prices = Object.fromEntries(PACKAGES.map((pkg) => [pkg.code, pkg.price]));
  assert.equal(prices.W1, 7000000);
  assert.equal(prices.A1, 24000000);
  assert.equal(prices.A2, 48000000);
  assert.equal(prices.B1, 3500000);
  assert.equal(prices.N2, 12000000);
  assert.equal(prices.E3, 12000000);
});

test('a project of 10M or more is paid 40/40/20', () => {
  const result = calculate({ packages: ['A1'] });
  assert.equal(result.oneTime.total, 24000000);
  assert.deepEqual(amounts(result.payments), [9600000, 9600000, 4800000]);
});

test('a project below 10M is paid 50/50', () => {
  const result = calculate({ packages: ['W1'] });
  assert.deepEqual(amounts(result.payments), [3500000, 3500000]);
});

test('payment parts always add up to the project total', () => {
  const result = calculate({ packages: ['N2', 'N3', 'S2'] });
  const project = result.payments.filter((payment) => payment.label.startsWith('Project'));
  assert.equal(project.reduce((total, payment) => total + payment.amount, 0), 18000000);
});

test('network example from the pricing model: N2 + N3 with three 1-hour visits', () => {
  const result = calculate({ packages: ['N2', 'N3'], visits: 3, travelHours: 1 });
  assert.equal(result.oneTime.total, 14500000);
  assert.equal(result.hourly.total, 750000);
  assert.equal(result.firstYear, 15250000);
});

test('discovery is paid upfront and 50% is credited when a build package is chosen', () => {
  const result = calculate({ packages: ['D1', 'A1'] });
  assert.equal(result.oneTime.total, 3000000 + 24000000 - 1500000);
  assert.equal(result.payments[0].amount, 3000000);
  assert.deepEqual(amounts(result.payments.slice(1)), [9000000, 9000000, 4500000]);
});

test('amount due at the start is discovery plus the first project payment', () => {
  assert.equal(calculate({ packages: ['D1', 'A1'] }).dueAtStart, 3000000 + 9000000);
  assert.equal(calculate({ packages: ['W1'] }).dueAtStart, 3500000);
  assert.equal(calculate({ retainer: 'basic' }).dueAtStart, 0);
});

test('discovery alone gets no credit', () => {
  const result = calculate({ packages: ['D2'] });
  assert.equal(result.oneTime.total, 6000000);
  assert.equal(result.oneTime.lines.length, 1);
});

test('only one package per exclusive group is kept', () => {
  assert.deepEqual(normalizeState({ packages: ['W2', 'W1', 'A1', 'A2'] }).packages, ['W2', 'A1']);
});

test('unknown packages and plans are dropped', () => {
  const state = normalizeState({ packages: ['X9', 'B1'], retainer: 'gold' });
  assert.deepEqual(state.packages, ['B1']);
  assert.equal(state.retainer, 'none');
});

test('hours round up to 30 minutes with a 1-hour minimum', () => {
  assert.equal(normalizeState({ hours: 2.2 }).hours, 2.5);
  assert.equal(normalizeState({ hours: 0.5 }).hours, 1);
  assert.equal(normalizeState({ hours: -3 }).hours, 0);
});

test('bad numeric input becomes zero and large input is capped', () => {
  const state = normalizeState({ hours: 'abc', visits: 999 });
  assert.equal(state.hours, 0);
  assert.equal(state.visits, 20);
});

test('hourly work uses one flat rate, with or without packages or a plan', () => {
  const alone = calculate({ hours: 6 });
  assert.deepEqual(alone.hourly.lines.map((line) => [line.hours, line.rate]), [[6, 500000]]);
  assert.equal(alone.hourly.total, 3000000);
  assert.equal(alone.oneTime.total, 0);
  assert.deepEqual(alone.documents, ['Service Agreement', 'Hourly work terms with an hour cap']);
  assert.equal(calculate({ hours: 6, packages: ['A1'], retainer: 'basic' }).hourly.total, 3000000);
});

test('a self-hosted mail server forces the Extended plan', () => {
  const result = calculate({ packages: ['E3'], retainer: 'basic' });
  assert.equal(result.state.retainer, 'extended');
  assert.equal(result.monthly.amount, 4000000);
  assert.equal(result.firstYear, 12000000 + 12 * 4000000);
});

test('a maintenance plan never costs more per included hour than the flat rate', () => {
  for (const plan of RETAINERS) {
    assert.ok(plan.price / (plan.preventive + plan.requests) <= RATES.hourly, plan.name);
  }
});

test('onboarding audit needs a plan and is capped at 4 hours', () => {
  assert.equal(normalizeState({ onboardingAudit: true }).onboardingAudit, false);
  const result = calculate({ retainer: 'standard', onboardingAudit: true });
  assert.equal(result.hourly.total, 2000000);
  assert.equal(result.monthly.minimumTotal, 7500000);
});

test('hints flag missing pieces', () => {
  assert.match(calculate({ packages: ['A1'] }).hints.join(), /needs a server/);
  assert.equal(calculate({ packages: ['A1', 'B1'] }).hints.length, 0);
  assert.match(calculate({ packages: ['E2'] }).hints.join(), /Business Email Setup/);
  assert.match(calculate({ packages: ['N1'] }).hints.join(), /onsite/);
  assert.match(calculate({ packages: ['A2', 'B2'] }).hints.join(), /phases/);
});

test('weeks add up across packages and hourly work', () => {
  assert.deepEqual(calculate({ packages: ['A1', 'B1'] }).weeks, [6, 6]);
  assert.deepEqual(calculate({ hours: 6 }).weeks, [1, 1]);
  assert.deepEqual(calculate({ hours: 30 }).weeks, [3, 3]);
  assert.equal(calculate({}).weeks, null);
});

test('documents depend on the contract type', () => {
  assert.deepEqual(calculate({}).documents, []);
  assert.deepEqual(calculate({ retainer: 'basic' }).documents, ['Service Agreement', 'Maintenance and Support Addendum']);
  assert.ok(calculate({ packages: ['W1'] }).documents.includes('Change Request form'));
});

test('state survives a round trip through the share link', () => {
  const state = { packages: ['D1', 'A1', 'B2'], retainer: 'standard', hours: 3.5, visits: 2, travelHours: 1.5, onboardingAudit: true };
  assert.deepEqual(decodeState(encodeState(state)), normalizeState(state));
  assert.deepEqual(decodeState('').packages, []);
});

test('formatting', () => {
  assert.equal(formatVnd(19475000), '19,475,000 VND');
  assert.equal(formatWeeks([3, 3]), 'about 3 weeks');
  assert.equal(formatWeeks([1, 1]), 'about 1 week');
  assert.equal(formatWeeks([8, 10]), 'about 8–10 weeks');
});

test('summary text lists every section', () => {
  const text = summaryText(calculate({ packages: ['A1'], hours: 2, retainer: 'basic' }), 'https://example.test/');
  assert.match(text, /A1 Internal App Small: 24,000,000 VND/);
  assert.match(text, /up to 1,000,000 VND/);
  assert.match(text, /Basic, 1,500,000 VND per month/);
  assert.match(text, /Link: https:\/\/example.test\//);
});
