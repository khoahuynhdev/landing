import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, proposal, PRESETS, CATALOG } from '../codex-pricing-model.mjs';
const item = (hours, quantity = 1) => ({ selected: true, hours, quantity });
test('website quote matches the reviewed document, including discounted milestones', () => {
  const result = calculate({ items: { website: item(16), deployment: item(4) }, contingency: 15, discount: 10 });
  assert.equal(result.total, 13455000);
  assert.deepEqual(result.milestones, [5382000, 5382000, 2691000]);
  assert.equal(result.weeks, 6);
});
test('application quote keeps recurring fees out of project milestones', () => {
  const result = calculate({ items: { application: item(48), deployment: item(6) }, contingency: 15, support: 'standard', months: 12 });
  assert.equal(result.total, 40365000);
  assert.equal(result.monthly, 2500000);
  assert.equal(result.budget, 70365000);
  assert.deepEqual(result.milestones, [16146000, 16146000, 8073000]);
  assert.equal(result.weeks, 16);
});
test('discount and contingency do not apply to external costs, travel or care', () => {
  const result = calculate({ items: { network: item(10, 2) }, contingency: 15, discount: 10, external: 10000000, travelHours: 2, support: 'standard', overageHours: 1.5, months: 3 });
  assert.equal(result.services, 13455000);
  assert.equal(result.total, 24105000);
  assert.equal(result.monthly, 3625000);
  assert.equal(result.budget, 34980000);
  assert.equal(result.milestones.reduce((a, b) => a + b), result.services);
});
test('empty estimate and no-retainer overage produce zero, not stale charges', () => {
  const result = calculate({ items: {}, support: 'none', overageHours: 10 });
  assert.equal(result.total, 0);
  assert.equal(result.monthly, 0);
  assert.equal(result.weeks, 0);
});
test('malformed values stay finite and nonnegative', () => {
  const result = calculate({ items: { onprem: item('oops', -5) }, contingency: 999, discount: -5, external: -500, travelHours: Infinity, support: 'unknown' });
  assert.equal(result.hours, 16);
  assert.equal(result.contingencyPercent, 20);
  assert.equal(result.discount, 0);
  assert.equal(result.external, 0);
  assert.ok(Number.isFinite(result.total));
});
test('all presets reference known services and produce balanced payments', () => {
  for (const preset of Object.values(PRESETS)) {
    const items = Object.fromEntries(Object.entries(preset.items).map(([id, quantity]) => {
      const catalog = CATALOG.find(row => row.id === id);
      assert.ok(catalog);
      return [id, item(catalog.hours, quantity)];
    }));
    const result = calculate({ items, support: preset.support, contingency: 15 });
    assert.equal(result.milestones.reduce((a, b) => a + b), result.services);
  }
});
test('export includes scope, exclusions, workflow, tax status and support boundaries', () => {
  const result = calculate({ items: { 'mail-server': item(24) }, support: 'basic' });
  const text = proposal(result, 'Example client');
  for (const expected of ['Example client', 'Self-hosted mail server', 'Excluded:', 'tax treatment pending', '14 calendar days', 'No 24/7', '40%', 'discovery', 'Hours are shared', 'urgent operations']) {
    assert.ok(text.includes(expected), expected);
  }
});

test('hourly engineering charges only rate × hours, ignoring all package inputs', async () => {
  const { calculateHourly } = await import('../codex-pricing-model.mjs');
  const result = calculateHourly({ service: 'engineering', hours: 4, items: { network: item(10) }, support: 'extended', contingency: 20, discount: 15, external: 1000000 });
  assert.equal(result.total, 2000000);
  assert.equal(result.rate, 500000);
  assert.equal(result.minimum, 1);
  assert.equal(calculateHourly({ service: 'consultation', hours: 1.25 }).total, 625000);
  assert.equal(calculateHourly({ service: 'troubleshooting', hours: 2.25 }).total, 1125000);
});
test('hourly caps enforce minimums and quarter-hour increments without silently increasing the cap', async () => {
  const { calculateHourly } = await import('../codex-pricing-model.mjs');
  for (const hours of ['', 0, -1, 0.75, 1.1, 501, NaN, Infinity]) {
    assert.throws(() => calculateHourly({ service: 'engineering', hours }), RangeError);
  }
  assert.throws(() => calculateHourly({ service: 'troubleshooting', hours: 1.75 }), RangeError);
});
test('hourly proposal describes actual billing and separate terms without quoting a package', async () => {
  const { calculateHourly, hourlyProposal } = await import('../codex-pricing-model.mjs');
  const text = hourlyProposal(calculateHourly({ service: 'engineering', hours: 4 }), 'Set up VPN');
  for (const expected of ['Set up VPN', '2,000,000', 'Monday–Friday', '07:30–09:00', '16:00–18:00', '19:00–21:00', 'UTC+7', 'spending limit', 'explicit approval', '15-minute', 'refunded', 'before applicable tax']) assert.ok(text.includes(expected), expected);
  assert.ok(!text.includes('Monthly planning total:'));
  assert.ok(!text.includes('Services payments:'));
});
