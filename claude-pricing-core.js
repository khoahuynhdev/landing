// Catalog and price math for the pricing calculator. No DOM code here, so
// Node can import this file in tests. Prices come from the pricing model:
// estimated hours x 500,000 VND x (1 + contingency), rounded to 500,000 VND.

// One flat rate for all hourly work: advice, troubleshooting, changes,
// maintenance overage, travel (at the travel factor) and audits.
export const RATES = {
  hourly: 500000,
  travelFactor: 0.5,
};

export const RULES = {
  smallProjectLimit: 10000000,
  discoveryCredit: 0.5,
  plannedHoursPerWeek: 12,
  onboardingAuditHours: 4,
  retainerMinimumMonths: 3,
  largeScopeWeeks: 10,
  maxHours: 200,
  maxVisits: 20,
  maxTravelHours: 8,
};

export const CATEGORIES = [
  {
    id: 'discovery',
    name: 'Discovery and assessment',
    intro: 'A small paid first step when the scope is not clear yet. 50% of the fee is credited if the project starts within 30 days.',
    packages: [
      {
        code: 'D1', name: 'Discovery Small', price: 3000000, weeks: [2, 2], group: 'discovery', kind: 'discovery',
        summary: 'Turn an idea into a written scope and a fixed-price quotation.',
        includes: ['One requirements workshop', 'Review of your current tools, data and process', 'Written scope with in-scope and out-of-scope items', 'Estimate and fixed-price quotation'],
        steps: ['Requirements workshop with your team', 'Review of current tools and data', 'Written scope for your review', 'Fixed-price quotation'],
        deliverables: ['Scope document', 'List of assumptions and risks', 'Quotation'],
        excludes: ['Design mockups', 'Code'],
      },
      {
        code: 'D2', name: 'Discovery Medium', price: 6000000, weeks: [2, 2], group: 'discovery', kind: 'discovery',
        summary: 'Discovery Small plus a data model, a screen list and a technical design.',
        includes: ['Up to two requirements workshops', 'Data model', 'Screen list with simple sketches', 'Technical design and milestone plan'],
        steps: ['Requirements workshops', 'Process and data review', 'Data model and screen list', 'Technical design and milestone plan', 'Fixed-price quotation'],
        deliverables: ['Scope document', 'Data model', 'Screen list', 'Technical design note', 'Milestone plan and quotation'],
        excludes: ['Visual design', 'Code'],
      },
      {
        code: 'T1', name: 'IT Assessment', price: 3000000, weeks: [2, 2], kind: 'discovery', onsite: true,
        summary: 'Find out what your office IT has and what to fix first.',
        includes: ['One onsite walkthrough', 'Inventory of devices, accounts, domains and backups', 'Risk review', 'Written recommendations in priority order'],
        steps: ['Onsite walkthrough', 'Inventory of devices, accounts, domains and backups', 'Risk review', 'Report with priorities and suggested packages'],
        deliverables: ['Inventory list', 'Risk list', 'Recommendations report'],
        excludes: ['Fixing the issues found', 'Penetration testing'],
      },
    ],
  },
  {
    id: 'software',
    name: 'Websites and web applications',
    intro: 'Fixed price, delivered in milestones with written acceptance criteria.',
    packages: [
      {
        code: 'W1', name: 'Website Starter', price: 7000000, weeks: [2, 3], group: 'website', kind: 'build',
        summary: 'A fast, simple website for a small business.',
        includes: ['Up to 5 pages', 'Contact form', 'Works on phones and computers', 'Basic SEO tags'],
        steps: ['Kick-off: goals, pages and content list', 'Design draft of the home page', 'Build all pages', 'Review with you', 'Launch on your domain', 'Handover'],
        deliverables: ['Live website', 'Source code', 'Handover notes'],
        excludes: ['Writing text and taking photos', 'Logo and brand design', 'Content management system', 'Hosting and domain fees'],
      },
      {
        code: 'W2', name: 'Website Standard', price: 14000000, weeks: [3, 4], group: 'website', kind: 'build',
        summary: 'A larger website that your staff can update.',
        includes: ['Up to 10 pages', 'Simple content management system or blog', 'Visitor analytics', 'Basic SEO'],
        steps: ['Kick-off: goals, sitemap and content list', 'Design draft', 'Build pages and content management', 'Review with you', 'Launch on your domain', 'Training for your editors', 'Handover'],
        deliverables: ['Live website', 'Source code', 'Editor guide', 'Handover notes'],
        excludes: ['Writing text and taking photos', 'Logo and brand design', 'Online shop and payments', 'Hosting and domain fees'],
      },
      {
        code: 'A1', name: 'Internal App Small', price: 24000000, weeks: [5, 5], group: 'app', kind: 'build',
        summary: 'One business process in a web app, for example stock tracking or bookings.',
        includes: ['1 module', 'Login', '3 to 5 screens', 'Create, view, edit and delete records', 'Simple export to Excel or CSV'],
        steps: ['Requirements and screen list sign-off', 'Milestone 1: data model, backend and first screens, with a demo', 'Milestone 2: all screens, export and testing, for your acceptance', 'Deployment to your server', 'Handover and training'],
        deliverables: ['Working application', 'Source code and database schema', 'Admin guide', 'Handover session'],
        excludes: ['Mobile app', 'Connections to other systems', 'Data migration from old systems', 'Server and hosting (see Deployment)'],
      },
      {
        code: 'A2', name: 'Internal App Medium', price: 48000000, weeks: [9, 10], group: 'app', kind: 'build',
        summary: 'Two or three connected business processes with user roles and reports.',
        includes: ['2 to 3 modules', 'User roles and permissions', 'Reports', 'Import and export'],
        steps: ['Requirements and screen list sign-off', 'Milestone 1: core module, with a demo', 'Milestone 2: other modules and user roles', 'Milestone 3: reports, import, export and testing, for your acceptance', 'Deployment to your server', 'Handover and training'],
        deliverables: ['Working application', 'Source code and database schema', 'Admin guide', 'Handover session'],
        excludes: ['Mobile app', 'Connections to other systems', 'Large data migrations', 'Server and hosting (see Deployment)'],
      },
    ],
  },
  {
    id: 'deploy',
    name: 'Deployment and servers',
    intro: 'Put an application into production, or set up servers at your office.',
    packages: [
      {
        code: 'B1', name: 'Basic Deployment', price: 3500000, weeks: [1, 1], group: 'deploy', kind: 'build',
        summary: 'One application on one Linux server, ready for production.',
        includes: ['1 Linux server', 'Docker Compose or systemd setup', 'Reverse proxy with HTTPS', 'Daily backup script', 'Runbook'],
        steps: ['Check server access', 'Harden and set up the server', 'Deploy the application', 'Set up the domain and HTTPS', 'Set up backups and test a restore', 'Hand over the runbook'],
        deliverables: ['Running application', 'Backup job', 'Runbook'],
        excludes: ['Server rental fees', 'Fixes to application code', 'High-availability setup'],
      },
      {
        code: 'B2', name: 'Deployment Plus', price: 6000000, weeks: [1, 1], group: 'deploy', kind: 'build',
        summary: 'Basic Deployment plus automatic releases and monitoring.',
        includes: ['Everything in Basic Deployment', 'CI/CD pipeline for automatic releases', 'Uptime monitoring', 'Alerts by email or chat'],
        steps: ['Check server access', 'Harden and set up the server', 'Deploy the application', 'Set up the domain and HTTPS', 'Build the release pipeline', 'Set up monitoring and alerts', 'Set up backups and test a restore', 'Hand over the runbook'],
        deliverables: ['Running application', 'Release pipeline', 'Monitoring and alerts', 'Backup job', 'Runbook'],
        excludes: ['Server rental fees', 'Fixes to application code', 'High-availability setup', '24/7 response to alerts'],
      },
      {
        code: 'B3', name: 'On-prem Setup', price: 9500000, weeks: [3, 3], group: 'onprem', kind: 'build', onsite: true,
        summary: 'One physical server at your office, installed and documented.',
        includes: ['Operating system install', 'Network and firewall setup', 'VPN access', 'Backups', 'Documentation'],
        steps: ['Bill of materials for you to buy', 'Onsite install and network setup', 'Firewall and VPN', 'Backups and restore test', 'Documentation and handover'],
        deliverables: ['Running server', 'Backup job', 'Network notes and runbook'],
        excludes: ['Hardware cost (you buy it from the vendor)', 'Rack, cabling and electrical work', 'Hardware repair'],
      },
      {
        code: 'B4', name: 'On-prem Extended', price: 15000000, weeks: [4, 4], group: 'onprem', kind: 'build', onsite: true,
        summary: 'Two or three servers, or a virtualization host, with a backup target.',
        includes: ['2 to 3 servers or one virtualization host', 'Network and firewall setup', 'Backup target', 'Documentation'],
        steps: ['Bill of materials for you to buy', 'Onsite install of servers or host', 'Network, firewall and VPN', 'Backup target and restore test', 'Documentation and handover'],
        deliverables: ['Running servers', 'Backup system', 'Network notes and runbook'],
        excludes: ['Hardware cost (you buy it from the vendor)', 'Rack, cabling and electrical work', 'Hardware repair'],
      },
    ],
  },
  {
    id: 'office',
    name: 'Office IT',
    intro: 'Networks, business email, file storage and backups. You buy hardware and licenses directly from the vendor.',
    packages: [
      {
        code: 'N1', name: 'Office Network Small', price: 6000000, weeks: [2, 2], group: 'network', kind: 'build', onsite: true,
        summary: 'Wired and Wi-Fi network for an office of up to 15 people.',
        includes: ['1 router or firewall', '1 to 2 switches', '2 to 3 Wi-Fi access points', 'Separate staff and guest Wi-Fi', 'Firewall rules', 'Network diagram'],
        steps: ['Onsite survey', 'Bill of materials for you to buy', 'Configure router, switches and Wi-Fi', 'Weekend cutover at your office', 'Test every room and device', 'Hand over the diagram and admin access'],
        deliverables: ['Working network', 'Network diagram', 'Admin credentials in your name'],
        excludes: ['Hardware cost', 'Cabling', 'Internet line installation', 'Staff computer setup'],
      },
      {
        code: 'N2', name: 'Office Network Standard', price: 12000000, weeks: [3, 3], group: 'network', kind: 'build', onsite: true,
        summary: 'Segmented network for an office of up to 40 people.',
        includes: ['Managed switches', 'Separate networks (VLANs) for staff, guests, cameras and servers', '4 to 8 Wi-Fi access points', 'Network diagram and runbook'],
        steps: ['Onsite survey', 'Network design and bill of materials', 'Configure router, switches, VLANs and Wi-Fi', 'Weekend cutover at your office', 'Test every room and device', 'Hand over the diagram, runbook and admin access'],
        deliverables: ['Working network', 'Network diagram', 'Runbook', 'Admin credentials in your name'],
        excludes: ['Hardware cost', 'Cabling', 'Internet line installation', 'Camera installation', 'Staff computer setup'],
      },
      {
        code: 'N3', name: 'Remote-access VPN', price: 2500000, weeks: [1, 1], kind: 'build',
        summary: 'Secure access to the office network from home, for up to 20 people.',
        includes: ['WireGuard or firewall VPN', 'Up to 20 users', 'User guide'],
        steps: ['Check the router or firewall', 'Set up the VPN', 'Create user access', 'Test from outside the office', 'User guide and handover'],
        deliverables: ['Working VPN', 'User guide', 'Admin notes'],
        excludes: ['Router or firewall hardware', 'Support on staff devices'],
      },
      {
        code: 'E1', name: 'Business Email Setup', price: 3000000, weeks: [1, 1], kind: 'build',
        summary: 'Business email on Google Workspace or Microsoft 365.',
        includes: ['New tenant on Google Workspace or Microsoft 365', 'Up to 20 mailboxes', 'SPF, DKIM and DMARC records', 'Admin handover', 'User guide'],
        steps: ['Choose the service and plan with you', 'Create the tenant and mailboxes', 'Set up DNS and email security records', 'Test sending and receiving', 'Hand over admin access and the user guide'],
        deliverables: ['Working mailboxes', 'DNS records', 'Admin access in your name', 'User guide'],
        excludes: ['License fees (paid to Google or Microsoft)', 'Moving old email (see Email Migration)'],
      },
      {
        code: 'E2', name: 'Email Migration', price: 7000000, weeks: [2, 3], kind: 'build',
        summary: 'Move up to 20 mailboxes from an old host to Google Workspace or Microsoft 365.',
        includes: ['Up to 20 mailboxes', 'Move old email from cPanel or IMAP hosts', 'DNS cutover', 'Check after the cutover'],
        steps: ['List mailboxes and sizes', 'Test migration of one mailbox', 'Migrate all mailboxes', 'Weekend DNS cutover', 'Check that mail flows', 'Final sync and handover'],
        deliverables: ['Old email in the new mailboxes', 'Updated DNS', 'Migration report'],
        excludes: ['License fees', 'More than 20 mailboxes (quoted separately)', 'Files outside email'],
      },
      {
        code: 'E3', name: 'Self-hosted Mail Server', price: 12000000, weeks: [3, 3], kind: 'build',
        summary: 'A mail server on your own server. Not recommended for most businesses.',
        includes: ['Mail server on your server', 'SPF, DKIM, DMARC and reverse DNS', 'Spam filter', 'Webmail', 'Backups'],
        steps: ['Check the server IP reputation and port 25', 'Install and secure the mail server', 'Set up DNS and email security records', 'Set up spam filter, webmail and backups', 'Test delivery to major providers', 'Handover'],
        deliverables: ['Working mail server', 'DNS records', 'Runbook'],
        excludes: ['Guaranteed delivery to every inbox', 'Server cost', '24/7 response'],
      },
      {
        code: 'S1', name: 'NAS / File Server', price: 5000000, weeks: [2, 2], kind: 'build', onsite: true,
        summary: 'Shared folders for your team on a Synology or TrueNAS device.',
        includes: ['Shared folders and permissions per department', 'Snapshots', 'Offsite backup', 'Up to 20 users'],
        steps: ['Plan folders and permissions with you', 'Bill of materials for you to buy', 'Install and configure the NAS', 'Set up snapshots and offsite backup', 'Test a restore', 'Hand over the admin guide'],
        deliverables: ['Working file server', 'Backup job', 'Admin guide'],
        excludes: ['NAS hardware and disks', 'Moving old files (hourly work)', 'Staff computer setup'],
      },
      {
        code: 'S2', name: 'Backup Setup', price: 3500000, weeks: [1, 1], kind: 'build',
        summary: '3-2-1 backups for your existing servers or NAS.',
        includes: ['Backup plan (3 copies, 2 media, 1 offsite)', 'Offsite copy', 'Restore test', 'Recovery runbook'],
        steps: ['List what must be backed up', 'Set up backup jobs', 'Set up the offsite copy', 'Test a restore', 'Write the recovery runbook'],
        deliverables: ['Backup jobs', 'Restore test result', 'Recovery runbook'],
        excludes: ['Storage and cloud fees', 'Backups for staff computers'],
      },
    ],
  },
];

export const RETAINERS = [
  { id: 'basic', name: 'Basic', price: 1500000, covers: '1 application or 1 server', preventive: 1, requests: 2 },
  { id: 'standard', name: 'Standard', price: 2500000, covers: '1 application and its server', preventive: 1.5, requests: 3.5 },
  { id: 'extended', name: 'Extended', price: 4000000, covers: 'Up to 2 applications or servers', preventive: 2, requests: 6 },
];

export const PACKAGES = CATEGORIES.flatMap((category) => category.packages);
const PACKAGE_BY_CODE = new Map(PACKAGES.map((pkg) => [pkg.code, pkg]));
const RETAINER_BY_ID = new Map(RETAINERS.map((plan) => [plan.id, plan]));
const APP_CODES = ['A1', 'A2'];
const SERVER_CODES = ['B1', 'B2', 'B3', 'B4'];

const vnd = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatVnd(amount) {
  return `${vnd.format(Math.round(amount))} VND`;
}

export function formatWeeks([min, max]) {
  return min === max ? `about ${min} ${min === 1 ? 'week' : 'weeks'}` : `about ${min}–${max} weeks`;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

// Billing is in 30-minute increments, so hours always round up to 0.5.
function toHalfHours(value, max) {
  return Math.ceil(clamp(value, 0, max) * 2) / 2;
}

export function normalizeState(input = {}) {
  const packages = [];
  const groups = new Set();
  for (const code of input.packages ?? []) {
    const pkg = PACKAGE_BY_CODE.get(code);
    if (!pkg || packages.includes(code)) continue;
    if (pkg.group) {
      if (groups.has(pkg.group)) continue;
      groups.add(pkg.group);
    }
    packages.push(code);
  }
  packages.sort((a, b) => PACKAGES.indexOf(PACKAGE_BY_CODE.get(a)) - PACKAGES.indexOf(PACKAGE_BY_CODE.get(b)));

  let hours = toHalfHours(input.hours, RULES.maxHours);
  if (hours > 0 && hours < 1) hours = 1;

  // A self-hosted mail server needs the largest plan; see the pricing model.
  let retainer = RETAINER_BY_ID.has(input.retainer) ? input.retainer : 'none';
  if (packages.includes('E3')) retainer = 'extended';

  return {
    packages,
    hours,
    visits: Math.round(clamp(input.visits, 0, RULES.maxVisits)),
    travelHours: input.travelHours === undefined ? 1 : toHalfHours(input.travelHours, RULES.maxTravelHours),
    retainer,
    onboardingAudit: Boolean(input.onboardingAudit) && retainer !== 'none',
  };
}

// Splits a total into parts that add up exactly; the last part takes the remainder.
function splitPayments(total, shares, labels) {
  const parts = shares.map((share) => Math.round((total * share) / 1000) * 1000);
  parts[parts.length - 1] = total - sum(parts.slice(0, -1));
  return parts.map((amount, i) => ({ label: labels[i], amount }));
}

function hourlyLine(label, hours, rate) {
  return { label, hours, rate, amount: hours * rate };
}

export function calculate(rawState) {
  const state = normalizeState(rawState);
  const selected = state.packages.map((code) => PACKAGE_BY_CODE.get(code));
  const discovery = selected.filter((pkg) => pkg.kind === 'discovery');
  const build = selected.filter((pkg) => pkg.kind === 'build');
  const discoveryTotal = sum(discovery.map((pkg) => pkg.price));
  const buildTotal = sum(build.map((pkg) => pkg.price));
  const credit = build.length ? Math.min(discoveryTotal * RULES.discoveryCredit, buildTotal) : 0;

  const oneTimeLines = selected.map((pkg) => ({ code: pkg.code, label: pkg.name, amount: pkg.price }));
  if (credit > 0) {
    oneTimeLines.push({ code: '', label: 'Discovery credit (if the project starts within 30 days)', amount: -credit });
  }
  const oneTimeTotal = discoveryTotal + buildTotal - credit;

  const plan = RETAINER_BY_ID.get(state.retainer) ?? null;
  const hourlyLines = [];
  if (state.hours) hourlyLines.push(hourlyLine('Hourly work, flat rate', state.hours, RATES.hourly));
  if (state.visits && state.travelHours) {
    const travel = state.visits * state.travelHours;
    hourlyLines.push(hourlyLine(`Onsite travel time (${state.visits} ${state.visits === 1 ? 'visit' : 'visits'}, at 50%)`, travel, RATES.hourly * RATES.travelFactor));
  }
  if (state.onboardingAudit) {
    hourlyLines.push(hourlyLine('Onboarding audit of an existing system', RULES.onboardingAuditHours, RATES.hourly));
  }
  const hourlyTotal = sum(hourlyLines.map((line) => line.amount));

  const monthly = plan ? plan.price : 0;
  const payments = [];
  if (discoveryTotal) payments.push({ label: 'Discovery and assessment, at the start', amount: discoveryTotal });
  const projectTotal = buildTotal - credit;
  let projectParts = [];
  if (projectTotal > 0) {
    projectParts = projectTotal >= RULES.smallProjectLimit
      ? splitPayments(projectTotal, [0.4, 0.4, 0.2], ['Project, at signing (40%)', 'Project, at milestone acceptance (40%)', 'Project, at final handover (20%)'])
      : splitPayments(projectTotal, [0.5, 0.5], ['Project, at signing (50%)', 'Project, at final handover (50%)']);
    payments.push(...projectParts);
  }
  if (hourlyTotal) payments.push({ label: 'Hourly work, by actual hours with the time log', amount: hourlyTotal, upTo: true });
  if (plan) payments.push({ label: `${plan.name} maintenance, monthly in advance`, amount: monthly, monthly: true });

  const hourWeeks = Math.ceil(state.hours / RULES.plannedHoursPerWeek);
  const weeks = selected.length || state.hours
    ? [sum(selected.map((pkg) => pkg.weeks[0])) + hourWeeks, sum(selected.map((pkg) => pkg.weeks[1])) + hourWeeks]
    : null;

  return {
    state,
    oneTime: { lines: oneTimeLines, total: oneTimeTotal },
    hourly: { lines: hourlyLines, total: hourlyTotal },
    monthly: plan
      ? { plan, amount: monthly, minimumMonths: RULES.retainerMinimumMonths, minimumTotal: monthly * RULES.retainerMinimumMonths }
      : null,
    firstYear: oneTimeTotal + hourlyTotal + monthly * 12,
    payments,
    dueAtStart: discoveryTotal + (projectParts[0]?.amount ?? 0),
    weeks,
    documents: documentsFor(selected, hourlyLines.length > 0, plan),
    hints: hintsFor(state, selected, weeks),
    workPlan: workPlanFor(selected, hourlyLines.length > 0, plan, state.onboardingAudit),
  };
}

function documentsFor(selected, hasHourly, plan) {
  if (!selected.length && !hasHourly && !plan) return [];
  const docs = ['Service Agreement'];
  if (selected.length) docs.push('Quotation and Statement of Work');
  if (hasHourly) docs.push('Hourly work terms with an hour cap');
  if (selected.some((pkg) => pkg.kind === 'build')) docs.push('Acceptance form', 'Change Request form');
  if (plan) docs.push('Maintenance and Support Addendum');
  return docs;
}

function hintsFor(state, selected, weeks) {
  const codes = new Set(state.packages);
  const hints = [];
  if (APP_CODES.some((code) => codes.has(code)) && !SERVER_CODES.some((code) => codes.has(code))) {
    hints.push('A web app needs a server. Add a deployment package, unless you already have a server and someone to deploy it.');
  }
  if (codes.has('E2') && !codes.has('E1')) {
    hints.push('Email Migration moves mail into an existing tenant. Add Business Email Setup, unless you already use Google Workspace or Microsoft 365.');
  }
  if (codes.has('E3')) {
    hints.push('A self-hosted mail server needs the Extended maintenance plan, so it is selected. Hosted email (E1 or E2) is more reliable for most businesses.');
  }
  const onsite = selected.filter((pkg) => pkg.onsite);
  if (onsite.length && !state.visits) {
    hints.push(`${onsite.map((pkg) => pkg.code).join(', ')} include onsite work. Add onsite visits under Hourly work to include travel time.`);
  }
  if (weeks && weeks[1] > RULES.largeScopeWeeks) {
    hints.push('This scope takes more than about 10 weeks. I split it into phases, and each phase has its own quotation.');
  }
  return hints;
}

function workPlanFor(selected, hasHourly, plan, onboardingAudit) {
  if (!selected.length && !hasHourly && !plan) return [];
  const items = [{ title: 'Free 30-minute call', steps: ['We talk about your needs and agree on the next step.'] }];
  for (const pkg of selected) items.push({ title: `${pkg.code} · ${pkg.name}`, steps: pkg.steps });
  if (hasHourly) {
    items.push({ title: 'Hourly work', steps: ['Agree the task and the hour cap in writing', 'Do the work in the scheduled window', 'Ask for approval before going over the cap', 'Send the time log with the invoice'] });
  }
  if (selected.some((pkg) => pkg.kind === 'build')) {
    items.push({ title: '30-day warranty', steps: ['Defects in the accepted scope are fixed free for 30 days after final acceptance.'] });
  }
  if (plan) {
    items.push({
      title: `${plan.name} maintenance`,
      steps: [
        onboardingAudit ? 'Onboarding audit of your existing system' : 'Onboarding: access check and monitoring check',
        'Monthly preventive work: security updates, backup restore test, certificate and disk checks, log review',
        'Your requests by email or the agreed chat group, handled in the support window',
        'Monthly status note and time log',
      ],
    });
  }
  return items;
}

export function encodeState(rawState) {
  const state = normalizeState(rawState);
  const params = new URLSearchParams();
  if (state.packages.length) params.set('p', state.packages.join(','));
  if (state.retainer !== 'none') params.set('r', state.retainer);
  if (state.hours) params.set('h', String(state.hours));
  if (state.visits) params.set('v', String(state.visits));
  if (state.visits && state.travelHours !== 1) params.set('vh', String(state.travelHours));
  if (state.onboardingAudit) params.set('a', '1');
  return params.toString();
}

export function decodeState(query) {
  const params = new URLSearchParams(query);
  return normalizeState({
    packages: (params.get('p') ?? '').split(',').filter(Boolean),
    retainer: params.get('r') ?? 'none',
    hours: params.get('h'),
    visits: params.get('v'),
    travelHours: params.has('vh') ? params.get('vh') : undefined,
    onboardingAudit: params.get('a') === '1',
  });
}

export function summaryText(result, link) {
  const lines = ['Pricing estimate (indicative, VND, exclusive of taxes)', ''];
  if (result.oneTime.lines.length) {
    lines.push('One-time, fixed price:');
    for (const line of result.oneTime.lines) lines.push(`  ${line.code ? `${line.code} ` : ''}${line.label}: ${formatVnd(line.amount)}`);
    lines.push(`  Total: ${formatVnd(result.oneTime.total)}`, '');
  }
  if (result.hourly.lines.length) {
    lines.push('Hourly work, up to:');
    for (const line of result.hourly.lines) lines.push(`  ${line.label}, ${line.hours} h: ${formatVnd(line.amount)}`);
    lines.push(`  Total: up to ${formatVnd(result.hourly.total)}`, '');
  }
  if (result.monthly) {
    lines.push(`Maintenance: ${result.monthly.plan.name}, ${formatVnd(result.monthly.amount)} per month, minimum ${result.monthly.minimumMonths} months`, '');
  }
  if (result.weeks) lines.push(`Estimated time: ${formatWeeks(result.weeks)}`);
  lines.push(`First 12 months: ${formatVnd(result.firstYear)}`);
  if (link) lines.push('', `Link: ${link}`);
  return lines.join('\n');
}
