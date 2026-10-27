import {
  CATEGORIES, RETAINERS, RATES, calculate, decodeState, encodeState, formatVnd, formatWeeks, summaryText,
} from './claude-pricing-core.js';

const CONTACT = 'hello@khoahuynh.dev';
const $ = (selector) => document.querySelector(selector);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
  return node;
}

const list = (tag, items) => el(tag, {}, items.map((item) => el('li', {}, item)));

function renderPackage(pkg) {
  const id = `pkg-${pkg.code}`;
  const model = pkg.kind === 'discovery'
    ? 'Fixed price, paid in full at the start'
    : 'Fixed price, paid in milestones';
  return el('div', { class: 'pkg', dataset: { code: pkg.code } },
    el('div', { class: 'pkg-head' },
      el('input', { type: 'checkbox', id, value: pkg.code, dataset: { group: pkg.group } }),
      el('label', { for: id }, el('span', { class: 'pkg-code' }, pkg.code), ' ', el('span', { class: 'pkg-name' }, pkg.name)),
      el('span', { class: 'pkg-price' }, formatVnd(pkg.price))),
    el('p', { class: 'pkg-summary' }, pkg.summary),
    el('details', { class: 'pkg-details' },
      el('summary', {}, 'Scope and steps'),
      el('div', { class: 'pkg-grid' },
        el('div', {}, el('h4', {}, 'Included'), list('ul', pkg.includes)),
        el('div', {}, el('h4', {}, 'Steps'), list('ol', pkg.steps)),
        el('div', {}, el('h4', {}, 'You receive'), list('ul', pkg.deliverables)),
        el('div', {}, el('h4', {}, 'Not included'), list('ul', pkg.excludes))),
      el('p', { class: 'pkg-meta' }, `Usual time: ${formatWeeks(pkg.weeks)} · ${model}`)));
}

function renderCatalog() {
  $('#packages').append(...CATEGORIES.map((category) => el('div', { class: 'cat' },
    el('h3', {}, category.name),
    el('p', { class: 'cat-intro' }, category.intro),
    category.packages.map(renderPackage))));

  const plans = [{ id: 'none', name: 'No plan' }, ...RETAINERS];
  $('#plans').append(...plans.map((plan) => el('label', { class: 'plan', for: `plan-${plan.id}` },
    el('input', { type: 'radio', name: 'plan', id: `plan-${plan.id}`, value: plan.id, checked: plan.id === 'none' }),
    el('span', { class: 'plan-name' }, plan.name),
    plan.price ? el('span', { class: 'plan-price' }, `${formatVnd(plan.price)} / month`) : null,
    plan.price
      ? el('span', { class: 'plan-desc' }, `Covers ${plan.covers.toLowerCase()}. ${plan.preventive + plan.requests} hours a month: ${plan.preventive} h preventive work and ${plan.requests} h for your requests.`)
      : el('span', { class: 'plan-desc' }, 'Pay only for hourly work when you need it.'))));
}

function readState() {
  return {
    packages: [...document.querySelectorAll('.pkg input:checked')].map((input) => input.value),
    hours: $('#hours').value,
    visits: $('#visits').value,
    travelHours: $('#travel-hours').value,
    retainer: $('input[name="plan"]:checked')?.value,
    onboardingAudit: $('#audit').checked,
  };
}

function writeState(state, { inputs = true } = {}) {
  for (const input of document.querySelectorAll('.pkg input')) input.checked = state.packages.includes(input.value);
  for (const input of document.querySelectorAll('input[name="plan"]')) {
    input.checked = input.value === state.retainer;
    input.disabled = state.packages.includes('E3') && input.value !== 'extended';
  }
  $('#audit').checked = state.onboardingAudit;
  $('#audit').disabled = state.retainer === 'none';
  if (inputs) {
    $('#hours').value = state.hours;
    $('#visits').value = state.visits;
    $('#travel-hours').value = state.travelHours;
  }
  for (const row of document.querySelectorAll('.pkg')) row.classList.toggle('is-selected', state.packages.includes(row.dataset.code));
}

function amountCell(amount, prefix = '') {
  return el('td', { class: 'num' }, `${prefix}${formatVnd(amount)}`);
}

function renderResult(result) {
  const root = $('#result');
  const { oneTime, hourly, monthly } = result;
  if (!oneTime.lines.length && !hourly.lines.length && !monthly) {
    root.replaceChildren(el('p', { class: 'empty' }, 'Choose a package, hourly work or a maintenance plan to see the estimate.'));
    return;
  }

  const stats = el('dl', { class: 'stats' },
    el('div', {}, el('dt', {}, 'One-time, fixed'), el('dd', {}, formatVnd(oneTime.total))),
    el('div', {}, el('dt', {}, 'Hourly, up to'), el('dd', {}, formatVnd(hourly.total))),
    el('div', {}, el('dt', {}, 'Monthly'), el('dd', {}, formatVnd(monthly ? monthly.amount : 0))),
    el('div', {}, el('dt', {}, 'First 12 months'), el('dd', {}, formatVnd(result.firstYear))));

  const rows = [];
  if (oneTime.lines.length) {
    rows.push(el('tr', { class: 'group' }, el('th', { scope: 'rowgroup', colspan: '2' }, 'One-time, fixed price')));
    for (const line of oneTime.lines) rows.push(el('tr', {}, el('td', {}, line.code ? `${line.code} · ${line.label}` : line.label), amountCell(line.amount)));
    rows.push(el('tr', { class: 'subtotal' }, el('td', {}, 'Total'), amountCell(oneTime.total)));
  }
  if (hourly.lines.length) {
    rows.push(el('tr', { class: 'group' }, el('th', { scope: 'rowgroup', colspan: '2' }, 'Hourly work, billed by actual hours')));
    for (const line of hourly.lines) {
      rows.push(el('tr', {}, el('td', {}, `${line.label}: ${line.hours} h × ${formatVnd(line.rate)}`), amountCell(line.amount)));
    }
    rows.push(el('tr', { class: 'subtotal' }, el('td', {}, 'Hour cap'), amountCell(hourly.total, 'up to ')));
  }
  if (monthly) {
    rows.push(el('tr', { class: 'group' }, el('th', { scope: 'rowgroup', colspan: '2' }, 'Maintenance')));
    rows.push(el('tr', {}, el('td', {}, `${monthly.plan.name} plan, per month`), amountCell(monthly.amount)));
    rows.push(el('tr', { class: 'subtotal' }, el('td', {}, `Minimum term, ${monthly.minimumMonths} months`), amountCell(monthly.minimumTotal)));
  }
  const lines = el('div', { class: 'table-wrap' }, el('table', { class: 'est' }, el('tbody', {}, rows)));

  const payments = el('div', { class: 'table-wrap' }, el('table', { class: 'est' },
    el('tbody', {}, result.payments.map((payment) => el('tr', {},
      el('td', {}, payment.label),
      amountCell(payment.amount, payment.upTo ? 'up to ' : ''))))));

  const children = [
    stats,
    el('h3', {}, 'Price'), lines,
    el('h3', {}, 'Payment schedule'), payments,
  ];
  if (result.weeks) {
    children.push(el('h3', {}, 'Time'), el('p', {}, `Estimated time: ${formatWeeks(result.weeks)}. I deliver one project at a time and packages one after another. The quotation gives the exact dates.`));
  }
  if (result.hints.length) children.push(el('div', { class: 'hints' }, result.hints.map((hint) => el('p', { class: 'hint' }, hint))));
  children.push(
    el('h3', {}, 'Work plan'),
    el('ol', { class: 'workplan' }, result.workPlan.map((item) => el('li', {},
      el('span', { class: 'flow-title' }, item.title),
      item.steps.length > 1 ? list('ol', item.steps) : ` ${item.steps[0]}`))),
    el('h3', {}, 'Documents you sign'),
    list('ul', result.documents));
  root.replaceChildren(...children);
}

function renderSummary(result) {
  const { oneTime, hourly, monthly } = result;
  $('#sum-once').textContent = formatVnd(oneTime.total);
  $('#sum-hourly').textContent = formatVnd(hourly.total);
  $('#sum-monthly').textContent = formatVnd(monthly ? monthly.amount : 0);
  $('#sum-year').textContent = formatVnd(result.firstYear);
  $('#sum-start').textContent = formatVnd(result.dueAtStart);

  const items = oneTime.lines.map((line) => el('li', {},
    el('span', {}, line.code ? `${line.code} · ${line.label}` : 'Discovery credit'),
    el('span', { class: 'num' }, formatVnd(line.amount))));
  if (hourly.lines.length) items.push(el('li', {}, el('span', {}, 'Hourly work, up to'), el('span', { class: 'num' }, formatVnd(hourly.total))));
  if (monthly) items.push(el('li', {}, el('span', {}, `${monthly.plan.name} plan, per month`), el('span', { class: 'num' }, formatVnd(monthly.amount))));
  $('#sum-lines').replaceChildren(...(items.length ? items : [el('li', { class: 'empty' }, 'Nothing selected yet.')]));
  $('#sum-time').textContent = result.weeks ? `Estimated time: ${formatWeeks(result.weeks)}` : '';
}

function update({ inputs = false } = {}) {
  const result = calculate(readState());
  writeState(result.state, { inputs });
  renderResult(result);
  renderSummary(result);

  $('#bar-once').textContent = formatVnd(result.oneTime.total);
  $('#bar-hourly').textContent = formatVnd(result.hourly.total);
  $('#bar-monthly').textContent = formatVnd(result.monthly ? result.monthly.amount : 0);

  const query = encodeState(result.state);
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
  const subject = encodeURIComponent('Pricing estimate');
  const body = encodeURIComponent(summaryText(result, location.href));
  for (const link of document.querySelectorAll('[data-email]')) link.href = `mailto:${CONTACT}?subject=${subject}&body=${body}`;
  return result;
}

let statusTimer;
function showStatus(message) {
  $('#status').textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('#status').textContent = ''; }, 4000);
}

async function copy(text, done) {
  try {
    await navigator.clipboard.writeText(text);
    showStatus(done);
  } catch {
    showStatus('Copy failed. Your browser blocked the clipboard.');
  }
}

function init() {
  renderCatalog();
  for (const node of document.querySelectorAll('[data-rate="hourly"]')) node.textContent = `${formatVnd(RATES.hourly)} per hour`;
  writeState(decodeState(location.search));

  const main = $('#main');
  main.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('.pkg input') && input.checked && input.dataset.group) {
      for (const other of document.querySelectorAll(`.pkg input[data-group="${input.dataset.group}"]`)) {
        if (other !== input) other.checked = false;
      }
    }
    update({ inputs: input.type === 'number' });
  });
  main.addEventListener('input', (event) => {
    if (event.target.type === 'number') update();
  });

  $('#copy-link').addEventListener('click', () => copy(location.href, 'Link copied.'));
  $('#copy-text').addEventListener('click', () => copy(summaryText(update(), location.href), 'Summary copied.'));
  $('#print').addEventListener('click', () => window.print());
  update({ inputs: true });
}

init();
