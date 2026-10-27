import { CATALOG, PRESETS, SUPPORT, RATE, HOURLY_SERVICES, calculate, calculateHourly, hourlyProposal, money, proposal } from './codex-pricing-model.mjs';
const $ = id => document.getElementById(id);
let activePreset = 'website';
let support = 'basic';
let result;
let pricingMode = 'hourly';
let hourlyText = '';

function renderHourly() {
  const service = HOURLY_SERVICES[$('hourly-service').value];
  $('hourly-hours').min = service.minimum;
  $('hourly-minimum').textContent = `Minimum booking: ${service.minimum} hour${service.minimum === 1 ? '' : 's'}. Then 15-minute increments.`;
  $('hourly-rate').textContent = money(service.rate);
  try {
    const estimate = calculateHourly({ service: $('hourly-service').value, hours: $('hourly-hours').value });
    $('hourly-total').textContent = money(estimate.total);
    $('hourly-calculation').textContent = `${estimate.hours} hours × ${money(estimate.rate)} / hour`;
    hourlyText = hourlyProposal(estimate, $('hourly-description').value);
    $('hourly-error').hidden = true;
    $('hourly-download').disabled = false;
    $('hourly-print').disabled = false;
  } catch (error) {
    $('hourly-error').textContent = error.message;
    $('hourly-error').hidden = false;
    $('hourly-total').textContent = '—';
    $('hourly-calculation').textContent = 'Enter a valid hour cap to calculate your estimate.';
    hourlyText = 'Hourly estimate incomplete. Enter a valid hour cap before quoting.';
    $('hourly-download').disabled = true;
    $('hourly-print').disabled = true;
  }
  if (pricingMode === 'hourly') $('proposal-text').textContent = hourlyText;
}

function setPricingMode(mode) {
  pricingMode = mode;
  document.querySelectorAll('[data-pricing-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pricingMode === mode)));
  document.querySelectorAll('[data-project-view]').forEach(element => element.hidden = mode !== 'project');
  $('hourly-work').hidden = mode !== 'hourly';
  $('delivery-link').href = mode === 'hourly' ? '#hourly-work' : '#workflow';
  render();
}
$('presets').innerHTML = Object.entries(PRESETS).map(([id, preset], i) => `<button type="button" class="preset" data-preset="${id}" aria-pressed="false"><span>0${i + 1}</span><strong>${preset.name}</strong><small>${id === 'office' ? 'Network + email + server' : id === 'website' ? 'Website + deployment' : id === 'application' ? 'Workflow + deployment' : 'Start with an empty estimate'}</small></button>`).join('');
$('catalog').innerHTML = CATALOG.map(item => `<article class="service" data-group="${item.group}" id="service-${item.id}"><div class="service-top"><label class="service-choice"><input type="checkbox" id="select-${item.id}" data-service="${item.id}"><span><strong>${item.name}</strong><small>${item.description}</small></span></label><span class="service-price">${money(item.hours * RATE)}<small>base labor / ${item.unit}</small></span></div><div class="service-controls"><label>Quantity<input id="quantity-${item.id}" type="number" min="1" max="20" step="1" value="1" aria-label="${item.name} quantity"></label><label>Hours / unit<input id="hours-${item.id}" type="number" min="0.25" max="500" step="0.25" value="${item.hours}" aria-label="${item.name} hours per unit"></label><span>${item.unit}<br><small>Base effort includes QA &amp; handover.</small></span></div><details><summary>Scope &amp; delivery steps</summary><p><b>Included per unit:</b> ${item.scope}</p><p><b>Excluded:</b> ${item.excludes}</p><ol>${item.steps.map(step => `<li>${step}</li>`).join('')}</ol></details></article>`).join('');
$('support-options').innerHTML = Object.entries(SUPPORT).map(([id, plan]) => `<label class="support-card"><input type="radio" name="support" value="${id}" ${id === support ? 'checked' : ''}><span><strong>${plan.name}</strong><span>${money(plan.fee)}<small> / month</small></span><small>${plan.hours ? `${plan.hours} included hours · ${money(plan.fee / plan.hours)}/hour` : 'Project + warranty only'}</small></span></label>`).join('');
function setPreset(id) {
  activePreset = id;
  const preset = PRESETS[id];
  support = preset.support;
  document.querySelectorAll('[name="support"]').forEach(input => input.checked = input.value === support);
  CATALOG.forEach(item => {
    $(`select-${item.id}`).checked = Boolean(preset.items[item.id]);
    $(`quantity-${item.id}`).value = preset.items[item.id] || 1;
    $(`hours-${item.id}`).value = item.hours;
  });
  $('overage').value = 0;
  render();
}
function inputState() {
  return { items: Object.fromEntries(CATALOG.map(item => [item.id, { selected: $(`select-${item.id}`).checked, quantity: $(`quantity-${item.id}`).value, hours: $(`hours-${item.id}`).value }])), support, contingency: $('contingency').value, discount: $('discount').value, external: $('external').value, travelHours: $('travel').value, weeklyHours: $('capacity').value, overageHours: $('overage').value, months: $('months').value };
}
function render() {
  CATALOG.forEach(item => {
    const selected = $(`select-${item.id}`).checked;
    $(`service-${item.id}`).classList.toggle('selected', selected);
    for (const field of ['quantity', 'hours']) $(`${field}-${item.id}`).disabled = !selected;
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.preset === activePreset)));
  $('overage').disabled = support === 'none';
  if (support === 'none') $('overage').value = 0;
  const invalid = [...document.querySelectorAll('.workspace input[type="number"]')].some(input => !input.disabled && (input.value === '' || !input.validity.valid));
  $('validation').hidden = !invalid;
  $('validation').textContent = invalid ? 'Enter valid values within the displayed field limits. Totals are provisional until these are corrected; export is disabled.' : '';
  result = calculate(inputState());
  const empty = !result.lines.length && !result.support.hours && !result.external && !result.travel;
  $('download').disabled = invalid || empty;
  $('print').disabled = invalid || empty;
  $('item-count').textContent = `${result.lines.length} service${result.lines.length === 1 ? '' : 's'}`;
  $('one-time').textContent = money(result.total);
  $('line-items').innerHTML = result.lines.length ? result.lines.map(line => `<div><span>${line.name}${line.quantity > 1 ? ` × ${line.quantity}` : ''}<small>${line.totalHours} hours</small></span><span>${money(line.labor)}</span></div>`).join('') : '<p class="small">Choose services to build your project, or select a support-only plan.</p>';
  $('breakdown').innerHTML = [['Engineering labor', result.labor], [`Contingency · ${result.contingencyPercent}%`, result.contingency], [`Discount · ${result.discountPercent}%`, -result.discount], ['Travel labor', result.travel], ['External costs', result.external]].map(([label, value]) => `<div><dt>${label}</dt><dd>${money(value)}</dd></div>`).join('');
  $('effective-rate').textContent = result.hours ? `${money(result.effectiveRate)} per estimated project hour, including contingency and discount. Travel, external costs and tax are separate.` : '';
  $('monthly').textContent = money(result.monthly);
  $('monthly-note').textContent = result.support.hours ? `${result.support.name} · ${result.support.hours} included hours${result.overageHours ? ` + ${result.overageHours} planned overage hours` : ''}` : 'No recurring support selected';
  $('budget-label').textContent = `${result.months}-month planning budget`;
  $('budget').textContent = money(result.budget);
  $('duration').textContent = result.hours ? `≈ ${result.weeks} weeks` : 'No project work selected';
  $('duration-note').textContent = result.hours ? `${result.weeklyHours} project hours/week, with contingency and travel. Customer waiting time is additional.` : 'Support appointments are scheduled separately.';
  const warnings = [];
  if (result.lines.some(line => line.id === 'mail-server')) warnings.push('Self-hosted mail needs paid discovery and a named owner for urgent mail operations. No guaranteed delivery or inbox placement.');
  if (result.lines.some(line => line.id === 'backup') && result.lines.some(line => ['deployment', 'mail-server'].includes(line.id))) warnings.push('Backup tasks overlap. Review scope and reduce duplicate effort before agreeing the quote.');
  if (result.support.hours && (result.lines.length > 2 || result.lines.some(line => ['network', 'onprem', 'hosted-mail', 'mail-server', 'vpn'].includes(line.id) || line.quantity > 1))) warnings.push('Support scope needs review for this estate. The selected retainer is one shared time allowance, not coverage of every device or user.');
  if (result.weeklyHours > 4) warnings.push('Higher delivery capacity needs confirmation alongside support and full-time employment commitments.');
  $('warnings').innerHTML = warnings.map(warning => `<p class="notice">${warning}</p>`).join('');
  result.milestones.forEach((amount, index) => $(`payment-${index + 1}`).textContent = result.services ? money(amount) : 'Set after scope review');
  $('selected-work').innerHTML = result.lines.length ? '<h3>Your selected work, step by step</h3>' + result.lines.map(line => `<article><div><span class="eyebrow">${line.group}</span><h4>${line.name}${line.quantity > 1 ? ` × ${line.quantity}` : ''}</h4><p>${line.scope}</p><p class="small">Excluded: ${line.excludes}</p></div><ol>${line.steps.map(step => `<li>${step}</li>`).join('')}</ol></article>`).join('') : '<p>Select a service to see its specific delivery steps here.</p>';
  $('proposal-text').textContent = proposal(result, $('estimate-name').value.trim() || 'IT services estimate');
  if (pricingMode === 'hourly') renderHourly();
}
document.addEventListener('input', event => {
  if (event.target.closest('#hourly-work')) {
    $('hourly-status').textContent = '';
    renderHourly();
    return;
  }
  if (event.target.closest('#catalog')) activePreset = 'custom';
  if (event.target.name === 'support') { support = event.target.value; activePreset = 'custom'; }
  if (event.target.matches('input, select')) render();
});
document.addEventListener('click', event => {
  const mode = event.target.closest('[data-pricing-mode]');
  if (mode) setPricingMode(mode.dataset.pricingMode);
  const preset = event.target.closest('[data-preset]');
  if (preset) setPreset(preset.dataset.preset);
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button === filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('.service').forEach(card => card.hidden = filter.dataset.filter !== 'All' && card.dataset.group !== filter.dataset.filter);
  }
});
$('download').addEventListener('click', () => {
  const blob = new Blob([$('proposal-text').textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'it-services-estimate.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('action-status').textContent = 'Proposal downloaded with scope, pricing, workflow and support terms.';
});
$('print').addEventListener('click', () => window.print());
$('hourly-download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([hourlyText], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'hourly-work-estimate.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('hourly-status').textContent = 'Hourly estimate downloaded with the rate, hour cap and booking terms.';
});
$('hourly-print').addEventListener('click', () => window.print());
setPreset(activePreset);
