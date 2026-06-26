import type { AISystem, WorkspaceData } from '../types';
import {
  RISK_CATEGORY_LABELS,
  SYSTEM_STATUS_LABELS,
} from '../types';
import { formatDate, relativeReview } from './dates';
import { systemGaps, systemCoverage, workspaceCoverage, COVERAGE_DISCLAIMER } from './coverage';
import { dashboardStats, reviewItems, isOpenRisk } from './selectors';
import { HELPER_DISCLAIMER } from './riskHelper';

const DISCLAIMER =
  '> **Disclaimer.** This document is a working governance artifact produced by a ' +
  'practical workspace tool. It is **not legal advice**, **not a certification**, ' +
  'and **does not establish EU AI Act, ISO/IEC 42001, or any other compliance status**. ' +
  'Framework references are high-level and require human (legal / privacy / security) review.';

function h(title: string, level = 1): string {
  return `${'#'.repeat(level)} ${title}\n`;
}

function meta(data: WorkspaceData, reportName: string): string {
  return (
    `*${reportName}* — **${data.organizationName}**  \n` +
    `*Generated:* ${new Date().toLocaleString()}\n\n${DISCLAIMER}\n`
  );
}

function list(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join('\n') + '\n' : '_None._\n';
}

function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return '_No records._\n';
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}\n`;
}

/* ------------------------------------------------------------------ */
/* 1. AI System Summary Report                                         */
/* ------------------------------------------------------------------ */

export function systemSummaryReport(data: WorkspaceData): string {
  const rows = data.systems
    .filter((s) => s.currentStatus !== 'archived')
    .map((s) => [
      s.systemName,
      s.owner || '—',
      SYSTEM_STATUS_LABELS[s.currentStatus],
      RISK_CATEGORY_LABELS[s.riskCategory],
      s.customerFacing ? 'Yes' : 'No',
      s.personalDataInvolved,
      s.nextReviewDate ? formatDate(s.nextReviewDate) : '—',
    ]);
  return (
    h('AI System Summary Report') +
    meta(data, 'AI System Summary Report') +
    '\n' +
    table(
      ['System', 'Owner', 'Status', 'Risk', 'Cust-facing', 'Personal data', 'Next review'],
      rows
    )
  );
}

/* ------------------------------------------------------------------ */
/* 2. AI Risk Register Report                                          */
/* ------------------------------------------------------------------ */

export function riskRegisterReport(data: WorkspaceData): string {
  const rows = data.risks.map((r) => [
    r.riskTitle,
    data.systems.find((s) => s.id === r.affectedAISystemId)?.systemName ?? '—',
    r.severity,
    `${r.likelihood}/${r.impact}`,
    r.status,
    r.owner || '—',
    r.reviewDate ? formatDate(r.reviewDate) : '—',
  ]);
  return (
    h('AI Risk Register Report') +
    meta(data, 'AI Risk Register Report') +
    '\n' +
    table(
      ['Risk', 'System', 'Severity', 'L/I', 'Status', 'Owner', 'Review'],
      rows
    )
  );
}

/* ------------------------------------------------------------------ */
/* 3. Audit Readiness Report                                           */
/* ------------------------------------------------------------------ */

export function auditReadinessReport(data: WorkspaceData): string {
  const stats = dashboardStats(data);
  const cov = workspaceCoverage(data);
  const overdue = reviewItems(data).filter((r) => r.state === 'overdue');

  let out = h('Audit Readiness Report') + meta(data, 'Audit Readiness Report') + '\n';
  out += h('Overview', 2);
  out += list([
    `AI systems (active): **${stats.totalSystems}**`,
    `Possible high-risk (review needed): **${stats.possibleHighRisk}**`,
    `Open high risks: **${stats.openHighRisks}**, open critical risks: **${stats.openCriticalRisks}**`,
    `Open incidents: **${stats.openIncidents}**`,
    `Controls without usable evidence: **${stats.controlsWithoutEvidence}**`,
    `Evidence Coverage: **${cov.pct}%** (${cov.documented}/${cov.expected} recommended items documented)`,
  ]);
  out += `\n> ${COVERAGE_DISCLAIMER}\n\n`;

  out += h('Pending reviews', 2);
  out += list([
    `Overdue: **${stats.overdueReviews}**`,
    `Due in 7 days: **${stats.due7}**`,
    `Due in 30 days: **${stats.due30}**`,
  ]);
  out += '\n' + h('Overdue items', 3);
  out += table(
    ['Type', 'Item', 'Owner', 'Due'],
    overdue.map((r) => [r.kind, r.title, r.owner || '—', relativeReview(r.date)])
  );

  out += '\n' + h('Per-system evidence coverage', 2);
  out += table(
    ['System', 'Documented', 'Coverage'],
    cov.perSystem.map((c) => {
      const s = data.systems.find((x) => x.id === c.systemId);
      return [s?.systemName ?? c.systemId, `${c.documented}/${c.expected}`, `${c.pct}%`];
    })
  );
  return out;
}

/* ------------------------------------------------------------------ */
/* 4. Control & Evidence Gap Report                                    */
/* ------------------------------------------------------------------ */

export function controlEvidenceGapReport(data: WorkspaceData): string {
  let out = h('Control & Evidence Gap Report') + meta(data, 'Control & Evidence Gap Report') + '\n';

  out += h('Controls missing usable evidence', 2);
  const controlRows = data.controls
    .filter((c) => c.evidenceRequired)
    .map((c) => {
      const usable = c.linkedEvidenceIds.filter((id) => {
        const e = data.evidence.find((x) => x.id === id);
        return e && (e.status === 'available' || e.status === 'reviewed');
      }).length;
      return { c, usable };
    })
    .filter((x) => x.usable === 0)
    .map((x) => [x.c.controlTitle, x.c.controlCategory, x.c.status, x.c.owner || '—']);
  out += table(['Control', 'Category', 'Status', 'Owner'], controlRows);

  out += '\n' + h('Per-system evidence gaps', 2);
  for (const s of data.systems.filter((x) => x.currentStatus !== 'archived')) {
    const cov = systemCoverage(s, data);
    if (cov.missingTypes.length === 0) continue;
    out += `\n**${s.systemName}** — ${cov.documented}/${cov.expected} documented\n`;
    out += list(cov.missingTypes.map((t) => `Missing: ${t}`));
  }

  out += '\n' + h('Evidence needing attention (missing / draft / expired)', 2);
  const evRows = data.evidence
    .filter((e) => ['missing', 'draft', 'expired'].includes(e.status))
    .map((e) => [e.evidenceTitle, e.evidenceType, e.status, e.owner || '—']);
  out += table(['Evidence', 'Type', 'Status', 'Owner'], evRows);
  return out;
}

/* ------------------------------------------------------------------ */
/* 5. Incident Summary Report                                          */
/* ------------------------------------------------------------------ */

export function incidentSummaryReport(data: WorkspaceData): string {
  const rows = data.incidents.map((i) => [
    i.incidentTitle,
    data.systems.find((s) => s.id === i.affectedAISystemId)?.systemName ?? '—',
    i.type,
    i.severity,
    i.status,
    i.owner || '—',
    formatDate(i.detectionTime),
  ]);
  let out =
    h('Incident / Issue Summary Report') +
    meta(data, 'Incident / Issue Summary Report') +
    '\n';
  out += table(
    ['Incident', 'System', 'Type', 'Severity', 'Status', 'Owner', 'Detected'],
    rows
  );
  const open = data.incidents.filter((i) => i.status !== 'closed' && i.status !== 'resolved');
  if (open.length) {
    out += '\n' + h('Open / active — lessons & follow-ups', 2);
    for (const i of open) {
      out += `\n### ${i.incidentTitle}\n`;
      out += list([
        `Root cause: ${i.rootCause || '—'}`,
        `Follow-up: ${i.followUpActions || '—'}`,
        `Lessons learned: ${i.lessonsLearned || '—'}`,
      ]);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 6. Management Overview Report                                       */
/* ------------------------------------------------------------------ */

export function managementOverviewReport(data: WorkspaceData): string {
  const stats = dashboardStats(data);
  let out = h('Management Overview Report') + meta(data, 'Management Overview Report') + '\n';
  out += h('AI portfolio at a glance', 2);
  out += list([
    `Active AI systems: **${stats.totalSystems}**`,
    `By risk band: ${Object.entries(stats.byRiskCategory)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${RISK_CATEGORY_LABELS[k as keyof typeof RISK_CATEGORY_LABELS]}: ${n}`)
      .join(', ') || '—'}`,
    `Systems flagged for legal review: **${stats.legalReview}**`,
    `Systems flagged for privacy review: **${stats.privacyReview}**`,
    `Systems flagged for security review: **${stats.securityReview}**`,
    `Vendor reviews pending: **${stats.vendorReview}**`,
  ]);
  out += '\n' + h('Risk & assurance', 2);
  out += list([
    `Open high / critical risks: **${stats.openHighRisks} / ${stats.openCriticalRisks}**`,
    `Open incidents: **${stats.openIncidents}**`,
    `Overdue reviews: **${stats.overdueReviews}** (due ≤7d: ${stats.due7}, ≤30d: ${stats.due30})`,
    `Evidence Coverage: **${stats.coveragePct}%** — not a compliance score`,
  ]);
  out += '\n' + h('Top open risks', 2);
  const top = data.risks
    .filter(isOpenRisk)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 8)
    .map((r) => [
      r.riskTitle,
      data.systems.find((s) => s.id === r.affectedAISystemId)?.systemName ?? '—',
      r.severity,
      r.owner || '—',
    ]);
  out += table(['Risk', 'System', 'Severity', 'Owner'], top);
  return out;
}

function severityRank(s: string): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[s] ?? 0;
}

/* ------------------------------------------------------------------ */
/* 7. Single-System Audit Pack                                         */
/* ------------------------------------------------------------------ */

export function singleSystemAuditPack(data: WorkspaceData, system: AISystem): string {
  const risks = data.risks.filter((r) => r.affectedAISystemId === system.id);
  const controls = data.controls.filter((c) => c.affectedAISystemIds.includes(system.id));
  const evidence = data.evidence.filter((e) => e.linkedAISystemIds.includes(system.id));
  const decisions = data.decisions.filter((d) => d.affectedAISystemId === system.id);
  const incidents = data.incidents.filter((i) => i.affectedAISystemId === system.id);
  const gaps = systemGaps(system, data);
  const cov = systemCoverage(system, data);

  let out = h(`Audit Pack — ${system.systemName}`) + meta(data, 'Single-System Audit Pack') + '\n';

  out += h('1. System summary', 2);
  out += list([
    `**Owner:** ${system.owner || '—'} (${system.businessUnit || '—'})`,
    `**Purpose:** ${system.businessPurpose || '—'}`,
    `**Status:** ${SYSTEM_STATUS_LABELS[system.currentStatus]}`,
    `**Risk band:** ${RISK_CATEGORY_LABELS[system.riskCategory]} _(not a legal determination)_`,
    `**Model / provider:** ${system.modelType || '—'} / ${system.vendorOrProvider || '—'}`,
    `**Deployment:** ${system.deploymentEnvironment || '—'} (${system.deploymentRegion || '—'})`,
    `**Autonomy:** ${system.autonomyLevel}; human review required: ${system.humanReviewRequired}`,
    `**Personal data:** ${system.personalDataInvolved}; sensitive data: ${system.sensitiveDataInvolved}`,
    `**Human oversight owner:** ${system.humanOversightOwner || '—'}`,
    `**Last / next review:** ${formatDate(system.lastReviewDate)} / ${formatDate(system.nextReviewDate)}`,
  ]);

  out += '\n' + h('2. Risk classification helper output', 2);
  if (system.classification) {
    const c = system.classification;
    out += `**Suggested band:** ${RISK_CATEGORY_LABELS[c.suggestedCategory]}\n\n`;
    out += `${c.summary}\n\n`;
    const flags = Object.entries(c.reviewFlags)
      .filter(([, v]) => v)
      .map(([k]) => k);
    out += `**Review flags:** ${flags.length ? flags.join(', ') : 'none'}\n\n`;
    out += '**Recommended next actions:**\n' + list(c.recommendedActions);
    out += `\n> ${HELPER_DISCLAIMER}\n`;
  } else {
    out += '_Risk Classification Helper has not been run for this system yet._\n';
  }

  out += '\n' + h('3. Review flags', 2);
  out += list(
    [
      system.legalReviewNeeded && 'Legal Review Recommended',
      system.privacyReviewNeeded && 'Privacy Review Recommended',
      system.securityReviewNeeded && 'Security Review Recommended',
      system.vendorReviewNeeded && 'Vendor Review Recommended',
      system.humanOversightReviewNeeded && 'Human Oversight Review Recommended',
    ].filter(Boolean) as string[]
  );

  out += '\n' + h('4. Linked risks', 2);
  out += table(
    ['Risk', 'Severity', 'Status', 'Owner'],
    risks.map((r) => [r.riskTitle, r.severity, r.status, r.owner || '—'])
  );

  out += '\n' + h('5. Linked controls', 2);
  out += table(
    ['Control', 'Category', 'Status', 'Owner'],
    controls.map((c) => [c.controlTitle, c.controlCategory, c.status, c.owner || '—'])
  );

  out += '\n' + h('6. Linked evidence', 2);
  out += table(
    ['Evidence', 'Type', 'Status', 'Reference'],
    evidence.map((e) => [e.evidenceTitle, e.evidenceType, e.status, e.fileReferenceOrUrlOrNote || '—'])
  );

  out += '\n' + h('7. Open gaps', 2);
  out += `_Evidence Coverage: ${cov.pct}% (${cov.documented}/${cov.expected})._\n\n`;
  out += list(gaps.map((g) => `${g.severity === 'warn' ? '⚠ ' : ''}${g.message}`));

  out += '\n' + h('8. Linked decisions', 2);
  out += table(
    ['Decision', 'Treatment', 'Owner', 'Date'],
    decisions.map((d) => [d.decisionTitle, d.riskTreatment, d.decisionOwner || '—', formatDate(d.date)])
  );

  out += '\n' + h('9. Linked incidents', 2);
  out += table(
    ['Incident', 'Type', 'Severity', 'Status'],
    incidents.map((i) => [i.incidentTitle, i.type, i.severity, i.status])
  );

  out += '\n' + h('10. Recommended next actions', 2);
  const actions = new Set<string>();
  if (system.classification) system.classification.recommendedActions.forEach((a) => actions.add(a));
  gaps.filter((g) => g.severity === 'warn').forEach((g) => actions.add(`Address: ${g.message}`));
  if (!system.nextReviewDate) actions.add('Set a next review date.');
  out += list([...actions]);

  return out;
}

export interface ReportDef {
  id: string;
  title: string;
  description: string;
  generate: (data: WorkspaceData) => string;
}

export const REPORTS: ReportDef[] = [
  {
    id: 'system-summary',
    title: 'AI System Summary',
    description: 'One-row-per-system overview: owner, status, risk band, review date.',
    generate: systemSummaryReport,
  },
  {
    id: 'risk-register',
    title: 'AI Risk Register',
    description: 'All risks with severity, likelihood/impact, status and owner.',
    generate: riskRegisterReport,
  },
  {
    id: 'audit-readiness',
    title: 'Audit Readiness',
    description: 'Portfolio status, pending reviews, and evidence coverage.',
    generate: auditReadinessReport,
  },
  {
    id: 'gap-report',
    title: 'Control & Evidence Gap',
    description: 'Controls missing evidence and per-system evidence gaps.',
    generate: controlEvidenceGapReport,
  },
  {
    id: 'incident-summary',
    title: 'Incident Summary',
    description: 'Incidents with type, severity, status and lessons learned.',
    generate: incidentSummaryReport,
  },
  {
    id: 'management-overview',
    title: 'Management Overview',
    description: 'Executive summary of the AI portfolio, risk and assurance.',
    generate: managementOverviewReport,
  },
];
