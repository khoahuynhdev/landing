export const RATE = 650000;
export const HOURLY_RATE = 500000;
export const BOOKING_WINDOWS = 'Monday–Friday, 07:30–09:00, 16:00–18:00 and 19:00–21:00 (Asia/Ho_Chi_Minh, UTC+7)';
export const HOURLY_SERVICES = {
  engineering: { name: 'Engineering & IT setup', rate: HOURLY_RATE, minimum: 1 },
  consultation: { name: 'Technical consultation', rate: HOURLY_RATE, minimum: 1 },
  troubleshooting: { name: 'Troubleshooting & investigation', rate: HOURLY_RATE, minimum: 2 },
};

// Hourly bookings are independent of package pricing and recurring support.
export function calculateHourly(input = {}) {
  const service = HOURLY_SERVICES[input.service] || HOURLY_SERVICES.engineering;
  const hours = Number(input.hours);
  if (!Number.isFinite(hours) || hours < service.minimum || hours > 500 || !Number.isInteger(hours * 4)) {
    throw new RangeError(`Enter ${service.minimum}–500 hours in 0.25-hour increments.`);
  }
  return { ...service, hours, total: Math.round(hours * service.rate) };
}

export function hourlyProposal(result, description = '') {
  return [
    'Standalone hourly work estimate',
    'VND · before applicable tax; tax treatment pending verification', '',
    `Service: ${result.name}`,
    `Requested work: ${description.trim() || 'To be agreed before booking'}`,
    `Flat rate: ${money(result.rate)} / hour`,
    `Proposed hour cap: ${result.hours} hours`,
    `Maximum labor budget: ${money(result.total)}`,
    `Minimum booking: ${result.minimum} hour${result.minimum === 1 ? '' : 's'}`, '',
    'Agree the task and hour cap → book a session → log time and work performed → review results and settle actual billable time.',
    'Bill actual time in 15-minute increments, aggregated per session, subject to the booking minimum. The minimum applies once per booking. Meetings, investigation, implementation, testing and documentation count toward the cap.',
    'The cap requires written acceptance before work starts. Stop at the cap; extra hours require explicit approval. The cap is a spending limit, not an automatic charge or a guarantee that the task will be completed within that time.',
    'Agree payment timing before booking. Prepaid time is reconciled to actual billable time; unused amounts above the minimum are refunded.',
    'No package fee, contingency markup, automatic discount, retainer or recurring commitment. The project calculator and its 40/40/20 milestones do not apply.',
    'Hardware, licenses, hosting, transport and travel labor are excluded and require a separate approved quote. Any deliverable-specific acceptance or warranty terms are agreed in writing.',
    `Booking windows: ${BOOKING_WINDOWS}. Appointments require confirmation; these windows do not reserve every hour or guarantee immediate response. Weekends and public holidays are by separate agreement.`,
    'No continuous support, 24/7 response, guaranteed uptime or guaranteed repair time.',
  ].join('\n');
}
export const SUPPORT = {
  none: { name: 'No retainer', fee: 0, hours: 0 },
  basic: { name: 'Basic', fee: 1500000, hours: 2 },
  standard: { name: 'Standard', fee: 2500000, hours: 3 },
  extended: { name: 'Extended', fee: 4000000, hours: 5 },
};
export const CATALOG = [
  { id: 'website', group: 'Software', name: 'Business website', unit: 'website', hours: 16, description: 'A small, responsive presence for your business.', scope: 'Up to 5 pages, supplied content, one visual direction, two consolidated revision rounds. Includes QA and handover; deployment is separate.', excludes: 'Copywriting, branding, payments, CMS and custom workflows.', steps: ['Agree page list and content', 'Review layout and build pages', 'Test mobile layout and links', 'Accept pages and hand over source'] },
  { id: 'application', group: 'Software', name: 'Internal application', unit: 'workflow', hours: 48, description: 'One focused workflow for your team.', scope: 'One bounded workflow with agreed screens, roles and reports. Includes requirements clarification, QA and handover; deployment is separate.', excludes: 'Open-ended ERP/CRM, large migrations, unspecified integrations and mobile apps.', steps: ['Map roles and acceptance examples', 'Build and demonstrate the workflow', 'Run user acceptance tests', 'Document and hand over source'] },
  { id: 'deployment', group: 'Infrastructure', name: 'Application deployment', unit: 'application / ready server', hours: 6, description: 'Take an application onto a ready Linux server.', scope: 'One application runtime, TLS, service startup, backup configuration and deployment runbook.', excludes: 'Server provisioning, hosting fees, high availability and data migration.', steps: ['Confirm access and runtime needs', 'Configure runtime, TLS and backups', 'Verify health and restart behavior', 'Hand over deployment runbook'] },
  { id: 'network', group: 'Infrastructure', name: 'Office network', unit: 'small office', hours: 10, description: 'A documented wired and Wi-Fi setup.', scope: 'One router/firewall, one managed switch and up to 2 access points; staff and guest networks, DHCP, configuration backup and network map. Existing cabling required.', excludes: 'Hardware, cabling, ISP charges, multi-site links and advanced security operations.', steps: ['Survey equipment and coverage needs', 'Agree network map and change window', 'Configure and test staff / guest access', 'Back up configuration and hand over map'] },
  { id: 'hosted-mail', group: 'Email & data', name: 'Business email setup', unit: 'domain / up to 10 users', hours: 6, description: 'Configure email on a customer-owned hosted service.', scope: 'One domain, up to 10 new accounts, mail authentication DNS configuration, send/receive checks and administrator handover.', excludes: 'Subscription fees, historical mailbox migration and guaranteed inbox placement.', steps: ['Confirm domain ownership and account list', 'Create accounts and configure mail DNS', 'Test send / receive and authentication', 'Hand over account administration'] },
  { id: 'mail-server', group: 'Email & data', name: 'Self-hosted mail server', unit: 'server / one domain', hours: 24, description: 'A dedicated mail system with explicit operating ownership.', scope: 'One Linux mail server, one domain, up to 10 accounts, TLS, mail authentication DNS, backup configuration, restore test and runbook. Requires discovery before a fixed quote.', excludes: 'Hosting, IP reputation guarantees, inbox placement, migration, 24/7 abuse handling and incident response.', steps: ['Validate hosting, DNS and operational ownership', 'Configure mail services and authentication', 'Test mail flow and backup recovery', 'Hand over operations and escalation runbook'] },
  { id: 'onprem', group: 'Infrastructure', name: 'On-premises server', unit: 'physical host', hours: 16, description: 'Prepare a small server for business workloads.', scope: 'One existing host, OS or hypervisor, storage configuration, up to 2 VMs, access controls, baseline monitoring and runbook. Application installation is separate.', excludes: 'Hardware, software licenses, rack/electrical work, clusters and high availability.', steps: ['Check hardware and workload requirements', 'Install host and provision VMs', 'Verify storage, access and restart behavior', 'Document inventory and admin access'] },
  { id: 'backup', group: 'Email & data', name: 'Backup & recovery setup', unit: 'source / target pair', hours: 6, description: 'A backup plan with a demonstrated restore.', scope: 'One source and backup destination, agreed schedule and retention, job alerts, one restore test and recovery notes. Replaces overlapping backup work in a deployment after scope review.', excludes: 'Storage charges, unlimited data migration and guaranteed recovery time / data-loss limits.', steps: ['Agree data, retention and destination', 'Configure scheduled backup and alerts', 'Restore a sample in an isolated location', 'Record recovery procedure and ownership'] },
  { id: 'vpn', group: 'Infrastructure', name: 'Remote-access VPN', unit: 'gateway / up to 5 users', hours: 4, description: 'Controlled remote access for a small team.', scope: 'One existing gateway, up to 5 user profiles, access rules, connection testing and onboarding notes.', excludes: 'Gateway purchase, site-to-site design, endpoint management and 24/7 support.', steps: ['Agree users and permitted resources', 'Configure gateway and access rules', 'Test remote access and revocation', 'Hand over onboarding instructions'] },
];
export const PRESETS = {
  website: { name: 'Business website', items: { website: 1, deployment: 1 }, support: 'basic' },
  office: { name: 'Small office IT', items: { network: 1, 'hosted-mail': 1, onprem: 1 }, support: 'none' },
  application: { name: 'Internal application', items: { application: 1, deployment: 1 }, support: 'standard' },
  custom: { name: 'Custom contract', items: {}, support: 'none' },
};
function bounded(value, min, max, fallback = min) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
export function calculate(input) {
  const lines = CATALOG.filter(item => input.items?.[item.id]?.selected).map(item => {
    const quantity = Math.round(bounded(input.items[item.id].quantity, 1, 20));
    const hours = bounded(input.items[item.id].hours, .25, 500, item.hours);
    return { ...item, quantity, hours, totalHours: quantity * hours, labor: Math.round(quantity * hours * RATE) };
  });
  const hours = lines.reduce((total, line) => total + line.totalHours, 0);
  const labor = lines.reduce((total, line) => total + line.labor, 0);
  const contingencyPercent = bounded(input.contingency, 0, 20, 15);
  const contingency = Math.round(labor * contingencyPercent / 100);
  const discountPercent = bounded(input.discount, 0, 15);
  const discount = Math.round((labor + contingency) * discountPercent / 100);
  const external = Math.round(bounded(input.external, 0, 1000000000));
  const travelHours = bounded(input.travelHours, 0, 200);
  const travel = Math.round(travelHours * 325000);
  const services = labor + contingency - discount;
  const total = services + external + travel;
  const support = SUPPORT[input.support] || SUPPORT.none;
  const overageHours = support.hours ? bounded(input.overageHours, 0, 20) : 0;
  const overage = Math.round(overageHours * 750000);
  const monthly = support.fee + overage;
  const months = Math.round(bounded(input.months, 1, 12, 12));
  const weeklyHours = bounded(input.weeklyHours, 1, 8, 4);
  const weeks = hours ? Math.ceil((hours * (1 + contingencyPercent / 100) + travelHours) / weeklyHours) : 0;
  const first = Math.round(services * .4);
  const second = Math.round(services * .4);
  return { lines, hours, labor, contingencyPercent, contingency, discountPercent, discount, services, external, travelHours, travel, total, support, overageHours, overage, monthly, months, budget: total + monthly * months, weeklyHours, weeks, milestones: [first, second, services - first - second] };
}
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
export function proposal(result, title = 'IT services estimate') {
  return [title, 'Indicative estimate · VND · tax treatment pending verification', '', 'SCOPE & DELIVERY',
    ...result.lines.flatMap(line => [`${line.name} × ${line.quantity}: ${money(line.labor)} labor (${line.totalHours} hours)`, `Included per unit: ${line.scope}`, `Excluded: ${line.excludes}`, ...line.steps.map((step, i) => `  ${i + 1}. ${step}`), '']),
    'PRICING', `Labor: ${money(result.labor)}`, `Contingency (${result.contingencyPercent}%): ${money(result.contingency)}`, `Discount (${result.discountPercent}%): −${money(result.discount)}`, `Professional services: ${money(result.services)}`, `Travel labor: ${money(result.travel)}`, `External costs: ${money(result.external)}`, `One-time total before applicable tax: ${money(result.total)}`, '',
    `Monthly support: ${result.support.name}, ${money(result.support.fee)} / ${result.support.hours} included hours`, `Optional approved overage: ${result.overageHours} hours / ${money(result.overage)}`, `Monthly planning total: ${money(result.monthly)}`, `${result.months}-month combined budget: ${money(result.budget)} (not a term commitment; excludes unentered third-party recurring costs and tax)`, '',
    `Delivery estimate: ${result.weeks} weeks at ${result.weeklyHours} project hours/week, including contingency and travel; client waiting time is additional.`,
    `Services payments: 40% ${money(result.milestones[0])} on signing; 40% ${money(result.milestones[1])} on agreed milestone acceptance; 20% ${money(result.milestones[2])} on final acceptance/handover. External costs prepaid after approval; travel separately agreed.`, '',
    'TERMS & SUPPORT',
    'Scope and capacity review → written quotation / SOW → signing and deposit → implementation and demonstration → acceptance and handover → optional scheduled care.',
    '30-day warranty for attributable in-scope defects from written final acceptance; covered fixes do not consume maintenance hours.',
    'Retainer coverage must name the systems. Standard catalog packages cover one application on one server; an office/network/mail estate requires a separately agreed support scope. Hours are shared across that scope, not per item.',
    'All communication, preventive checks and investigation count toward the monthly allowance. Unused hours expire. Overage needs written approval; no emergency spending authorization is implied.',
    `Booking windows: ${BOOKING_WINDOWS}, by confirmed appointment. Weekends and public holidays by separate agreement. Acknowledgment target: two business days. Bug investigation appointment arranged within three business days; this is not a guaranteed start or repair deadline.`,
    'Critical incidents: best effort. No 24/7 staffing, uptime guarantee or guaranteed recovery time. Automated alerts do not mean continuous human monitoring.',
    'Self-hosted mail requires discovery and a named provider for urgent operations. Backup ownership, retention and restore responsibility must be agreed.',
    'Retainers paid monthly in advance; one-month initial term, monthly renewal, 14 calendar days notice before renewal to stop. New features and major migrations are separately quoted.',
    'Prices are planning assumptions, not a binding offer. Confirm overlapping scope, third-party costs, tax/withholding, acceptance criteria and availability before signing.',
  ].join('\n');
}
