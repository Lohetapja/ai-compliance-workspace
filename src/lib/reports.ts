import type { AISystem, GapAction, WorkspaceData } from '../types';
import {
  RISK_CATEGORY_LABELS,
  SYSTEM_STATUS_LABELS,
} from '../types';
import { formatDate, relativeReview } from './dates';
import { systemCoverage, systemGaps, workspaceCoverage, COVERAGE_DISCLAIMER } from './coverage';
import { dashboardStats, reviewItems, isOpenRisk } from './selectors';
import {
  AI_SECURITY_CATEGORIES,
  aiActBuckets,
  auditEvidenceBuckets,
  gdprSystems,
  iso42001Areas,
  nis2Rows,
  securityRelevantRisks,
  vendorReviewsPending,
} from './lenses';
import { evidenceFreshness, FRESHNESS_LABELS } from './freshness';
import { HELPER_DISCLAIMER } from './riskHelper';

const DISCLAIMER =
  '> **Disclaimer.** This report is not legal advice, not a compliance certification, and not a final legal determination. It is a structured governance and audit-preparation summary. Framework references are high-level and require human legal, privacy, security, and governance review. Sample data in this demo is fictional; any resemblance to real companies, products, people, or incidents is unintentional.';

function h(title: string, level = 1): string {
  return `${'#'.repeat(level)} ${title}\n`;
}

function meta(data: WorkspaceData, reportName: string): string {
  return (
    `*${reportName}* - **${data.organizationName}**  \n` +
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
  const body = rows.map((r) => `| ${r.map((c) => String(c ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}\n`;
}

function systemName(data: WorkspaceData, id: string): string {
  return data.systems.find((s) => s.id === id)?.systemName ?? '—';
}

function activeGapActions(data: WorkspaceData, systemId?: string): GapAction[] {
  return (data.gapActions ?? []).filter((g) => {
    if (systemId && g.affectedAISystemId !== systemId) return false;
    return g.status !== 'done' && g.status !== 'accepted-risk';
  });
}

function severityRank(s: string): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[s] ?? 0;
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
      ['System', 'Owner', 'Status', 'Risk', 'Customer-facing', 'Personal data', 'Next review'],
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
    systemName(data, r.affectedAISystemId),
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
    table(['Risk', 'System', 'Severity', 'Likelihood/Impact', 'Status', 'Owner', 'Review'], rows)
  );
}

/* ------------------------------------------------------------------ */
/* 3. Audit Readiness Report                                           */
/* ------------------------------------------------------------------ */

export function auditReadinessReport(data: WorkspaceData): string {
  const stats = dashboardStats(data);
  const cov = workspaceCoverage(data);
  const overdue = reviewItems(data).filter((r) => r.state === 'overdue');
  const openGaps = activeGapActions(data);

  let out = h('Audit Readiness Report') + meta(data, 'Audit Readiness Report') + '\n';
  out += h('Overview', 2);
  out += list([
    `AI systems active: **${stats.totalSystems}**`,
    `Possible elevated/high-review areas: **${stats.possibleHighRisk}**`,
    `Open high risks: **${stats.openHighRisks}**, open critical risks: **${stats.openCriticalRisks}**`,
    `Open incidents/issues: **${stats.openIncidents}**`,
    `Open gap actions: **${stats.openGapActions}**`,
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

  out += '\n' + h('Open gap actions', 2);
  out += table(
    ['Action', 'System', 'Severity', 'Status', 'Owner', 'Due'],
    openGaps.map((g) => [g.title, systemName(data, g.affectedAISystemId), g.severity, g.status, g.owner || '—', formatDate(g.dueDate)])
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
    out += `\n**${s.systemName}** - ${cov.documented}/${cov.expected} documented\n`;
    out += list(cov.missingTypes.map((t) => `Missing: ${t}`));
  }

  out += '\n' + h('Open gap actions', 2);
  out += table(
    ['Action', 'System', 'Gap type', 'Severity', 'Status', 'Owner'],
    activeGapActions(data).map((g) => [g.title, systemName(data, g.affectedAISystemId), g.gapType, g.severity, g.status, g.owner || '—'])
  );

  out += '\n' + h('Evidence needing attention', 2);
  const evRows = data.evidence
    .filter((e) => ['missing', 'draft', 'expired'].includes(e.status))
    .map((e) => [e.evidenceTitle, e.evidenceType, e.status, e.owner || '—', formatDate(e.reviewDate)]);
  out += table(['Evidence', 'Type', 'Status', 'Owner', 'Review'], evRows);
  return out;
}

/* ------------------------------------------------------------------ */
/* 5. Incident Summary Report                                          */
/* ------------------------------------------------------------------ */

export function incidentSummaryReport(data: WorkspaceData): string {
  const rows = data.incidents.map((i) => [
    i.incidentTitle,
    systemName(data, i.affectedAISystemId),
    i.type,
    i.severity,
    i.status,
    i.owner || '—',
    formatDate(i.detectionTime),
  ]);
  let out = h('Incident / Issue Summary Report') + meta(data, 'Incident / Issue Summary Report') + '\n';
  out += table(['Incident', 'System', 'Type', 'Severity', 'Status', 'Owner', 'Detected'], rows);
  const open = data.incidents.filter((i) => i.status !== 'closed' && i.status !== 'resolved');
  if (open.length) {
    out += '\n' + h('Open / active follow-up', 2);
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
  const attention = data.systems.filter((s) => s.currentStatus !== 'archived' && (
    s.legalReviewNeeded ||
    s.privacyReviewNeeded ||
    s.securityReviewNeeded ||
    s.vendorReviewNeeded ||
    !s.nextReviewDate
  ));
  const openGaps = activeGapActions(data)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 8);

  let out = h('Management Overview Report') + meta(data, 'Management Overview Report') + '\n';
  out += h('Executive summary', 2);
  out += 'This report gives a short leadership view of the fictional AI portfolio: systems needing review, open risks, evidence coverage, incidents, and priority gaps.\n\n';

  out += h('Portfolio snapshot', 2);
  out += list([
    `Total active AI systems: **${stats.totalSystems}**`,
    `Systems needing review: **${attention.length}**`,
    `Possible elevated/high-review areas: **${stats.possibleHighRisk}**`,
    `Open high / critical risks: **${stats.openHighRisks} / ${stats.openCriticalRisks}**`,
    `Open incidents/issues: **${stats.openIncidents}**`,
    `Evidence coverage: **${stats.coveragePct}%** - not a compliance score`,
    `Overdue reviews: **${stats.overdueReviews}**`,
    `Open gap actions: **${stats.openGapActions}**`,
  ]);

  out += '\n' + h('Key gaps', 2);
  out += table(
    ['Gap action', 'System', 'Severity', 'Owner', 'Due'],
    openGaps.map((g) => [g.title, systemName(data, g.affectedAISystemId), g.severity, g.owner || '—', formatDate(g.dueDate)])
  );

  out += '\n' + h('Recommended next actions', 2);
  const next = new Set<string>();
  if (stats.openGapActions) next.add('Review open gap actions and assign owners/due dates where missing.');
  if (stats.controlsWithoutEvidence) next.add('Prioritize controls that require evidence but have no usable evidence linked.');
  if (stats.openHighRisks || stats.openCriticalRisks) next.add('Review open high/critical risks with system owners.');
  if (stats.openIncidents) next.add('Confirm incident follow-up actions and lessons learned.');
  if (stats.overdueReviews) next.add('Update overdue system, risk, control, evidence, decision, or gap-action reviews.');
  out += list([...next]);
  return out;
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
  const gapActions = activeGapActions(data, system.id);

  let out = h(`Single-System Audit Pack - ${system.systemName}`) + meta(data, 'Single-System Audit Pack') + '\n';

  out += h('1. Disclaimer', 2);
  out += `${DISCLAIMER}\n\n`;

  out += h('2. AI System Overview', 2);
  out += list([
    `System: **${system.systemName}**`,
    `Description: ${system.description || '—'}`,
    `Status: ${SYSTEM_STATUS_LABELS[system.currentStatus]}`,
    `Risk band: ${RISK_CATEGORY_LABELS[system.riskCategory]} (not a legal determination)`,
  ]);

  out += '\n' + h('3. Business Purpose', 2);
  out += `${system.businessPurpose || '_No business purpose recorded._'}\n`;

  out += '\n' + h('4. Ownership and Review Dates', 2);
  out += list([
    `Owner: ${system.owner || '—'}`,
    `Business unit: ${system.businessUnit || '—'}`,
    `Human oversight owner: ${system.humanOversightOwner || '—'}`,
    `Last review: ${formatDate(system.lastReviewDate)}`,
    `Next review: ${formatDate(system.nextReviewDate)}`,
  ]);

  out += '\n' + h('5. Deployment Context', 2);
  out += list([
    `Use: ${system.internalOrExternalUse}`,
    `Customer-facing: ${system.customerFacing ? 'Yes' : 'No'}`,
    `Model / provider: ${system.modelType || '—'} / ${system.vendorOrProvider || '—'}`,
    `Deployment: ${system.deploymentEnvironment || '—'} (${system.deploymentRegion || '—'})`,
    `Autonomy: ${system.autonomyLevel}`,
    `Human review required: ${system.humanReviewRequired}`,
  ]);

  out += '\n' + h('6. Data Used', 2);
  out += list([
    `Data used: ${system.dataUsed || '—'}`,
    `Data sources: ${system.dataSources || '—'}`,
    `Data provenance known: ${system.dataProvenanceKnown}`,
    `Training data: ${system.trainingDataUsed || '—'}`,
    `Inference data: ${system.inferenceDataUsed || '—'}`,
  ]);

  out += '\n' + h('7. Personal/Sensitive Data Flags', 2);
  out += list([
    `Personal data involved: ${system.personalDataInvolved}`,
    `Sensitive data involved: ${system.sensitiveDataInvolved}`,
    `Privacy review recommended: ${system.privacyReviewNeeded ? 'Yes' : 'No'}`,
  ]);

  out += '\n' + h('8. Risk Classification Helper Result', 2);
  if (system.classification) {
    const c = system.classification;
    const flags = Object.entries(c.reviewFlags).filter(([, v]) => v).map(([k]) => k);
    out += list([
      `Suggested band: ${RISK_CATEGORY_LABELS[c.suggestedCategory]}`,
      `Summary: ${c.summary}`,
      `Review flags: ${flags.length ? flags.join(', ') : 'none'}`,
    ]);
    out += '**Recommended helper actions:**\n' + list(c.recommendedActions);
    out += `\n> ${HELPER_DISCLAIMER}\n`;
  } else {
    out += '_Risk Classification Helper has not been run for this system yet._\n';
  }

  out += '\n' + h('9. Review Flags', 2);
  out += list([
    system.legalReviewNeeded ? 'Legal review recommended' : '',
    system.privacyReviewNeeded ? 'Privacy review recommended' : '',
    system.securityReviewNeeded ? 'Security review recommended' : '',
    system.vendorReviewNeeded ? 'Vendor review recommended' : '',
    system.humanOversightReviewNeeded ? 'Human-oversight review recommended' : '',
  ].filter(Boolean));

  out += '\n' + h('10. Linked Risks', 2);
  out += table(['Risk', 'Severity', 'Status', 'Owner', 'Mitigation'], risks.map((r) => [r.riskTitle, r.severity, r.status, r.owner || '—', r.mitigation || '—']));

  out += '\n' + h('11. Linked Controls', 2);
  out += table(['Control', 'Category', 'Status', 'Owner'], controls.map((c) => [c.controlTitle, c.controlCategory, c.status, c.owner || '—']));

  out += '\n' + h('12. Linked Evidence', 2);
  out += table(
    ['Evidence', 'Type', 'Status', 'Freshness', 'Owner', 'Reference'],
    evidence.map((e) => [
      e.evidenceTitle,
      e.evidenceType,
      e.status,
      FRESHNESS_LABELS[evidenceFreshness(e)],
      e.owner || '—',
      e.fileReferenceOrUrlOrNote || '—',
    ])
  );

  out += '\n' + h('13. Missing Evidence', 2);
  out += `_Evidence Coverage: ${cov.pct}% (${cov.documented}/${cov.expected})._\n\n`;
  out += list(cov.missingTypes.map((t) => `Missing: ${t}`));

  out += '\n' + h('14. Open Gap Actions', 2);
  out += table(['Action', 'Gap type', 'Severity', 'Status', 'Owner', 'Due'], gapActions.map((g) => [g.title, g.gapType, g.severity, g.status, g.owner || '—', formatDate(g.dueDate)]));

  out += '\n' + h('15. Linked Decisions', 2);
  out += table(['Decision', 'Treatment', 'Owner', 'Date', 'Reason'], decisions.map((d) => [d.decisionTitle, d.riskTreatment, d.decisionOwner || '—', formatDate(d.date), d.reason || '—']));

  out += '\n' + h('16. Linked Incidents / Issues', 2);
  out += table(['Incident', 'Type', 'Severity', 'Status', 'Follow-up'], incidents.map((i) => [i.incidentTitle, i.type, i.severity, i.status, i.followUpActions || '—']));

  out += '\n' + h('17. Linked Vendors', 2);
  const linkedVendors = (data.vendors ?? []).filter((v) => v.linkedAISystemIds.includes(system.id));
  out += table(
    ['Vendor', 'Type', 'Dependency', 'Privacy', 'Security', 'DPA'],
    linkedVendors.map((v) => [v.vendorName, v.serviceType, v.vendorDependencyRisk, v.privacyReviewStatus, v.securityReviewStatus, v.dpaStatus])
  );

  out += '\n' + h('18. Framework Lens Summary (this system)', 2);
  const lensFlags = aiActBuckets(data)
    .filter((b) => b.systems.some((s) => s.id === system.id))
    .map((b) => b.label);
  const nis2Flags = nis2Rows(data).find((r) => r.system.id === system.id)?.flags ?? [];
  const secCount = securityRelevantRisks(data).filter((r) => r.affectedAISystemId === system.id).length;
  out += list([
    `AI Act-relevant review areas: ${lensFlags.length ? lensFlags.join('; ') : 'none flagged'}`,
    `GDPR-relevant: personal data ${system.personalDataInvolved}, sensitive ${system.sensitiveDataInvolved}, DPIA ${system.dpiaStatus ?? '—'}`,
    `NIS2-relevant flags: ${nis2Flags.length ? nis2Flags.join(', ') : 'none'}`,
    `AI security-relevant risks (OWASP/MITRE-inspired): ${secCount}`,
  ]);
  out += '_High-level orientation only — not a legal or compliance determination._\n';

  out += '\n' + h('19. Framework Mapping Summary', 2);
  out += list([
    `System framework tags: ${system.frameworkTags.length ? system.frameworkTags.join(', ') : '—'}`,
    `Control framework tags: ${[...new Set(controls.flatMap((c) => c.frameworkTags))].join(', ') || '—'}`,
    `Evidence framework tags: ${[...new Set(evidence.flatMap((e) => e.frameworkTags))].join(', ') || '—'}`,
  ]);

  out += '\n' + h('20. Recommended Next Actions', 2);
  const actions = new Set<string>();
  if (system.classification) system.classification.recommendedActions.forEach((a) => actions.add(a));
  gaps.filter((g) => g.severity === 'warn').forEach((g) => actions.add(`Address: ${g.message}`));
  gapActions.forEach((g) => actions.add(`Resolve gap action: ${g.title}`));
  if (!system.nextReviewDate) actions.add('Set a next review date.');
  out += list([...actions]);

  out += '\n' + h('21. Review Notes', 2);
  out += `${system.notes || '_No review notes recorded._'}\n`;

  out += '\n' + h('22. Export Timestamp', 2);
  out += `${new Date().toISOString()}\n`;

  return out;
}

/* ------------------------------------------------------------------ */
/* 8. Framework Lens Summary Report                                    */
/* ------------------------------------------------------------------ */

export function frameworkLensSummaryReport(data: WorkspaceData): string {
  let out = h('Framework Lens Summary Report') + meta(data, 'Framework Lens Summary Report') + '\n';
  out +=
    '> These are high-level organizational views, not legal advice, certification, or a final ' +
    'compliance determination. They do not reproduce official framework text.\n\n';

  out += h('1. AI Act-relevant review areas', 2);
  out += table(
    ['Review area', 'Systems'],
    aiActBuckets(data).map((b) => [b.label, b.systems.map((s) => s.systemName).join(', ') || '—'])
  );

  out += '\n' + h('2. ISO/IEC 42001-inspired governance areas', 2);
  out += table(
    ['Area', 'Controls', 'Evidence', 'Open gaps', 'Status'],
    iso42001Areas(data).map((a) => [
      a.key,
      String(a.controls.length),
      String(a.evidence.length),
      String(a.gapCount),
      a.status,
    ])
  );

  out += '\n' + h('3. GDPR-relevant privacy areas', 2);
  out += table(
    ['System', 'Personal', 'Sensitive', 'DPIA', 'Automated decision'],
    gdprSystems(data).map((s) => [
      s.systemName,
      s.personalDataInvolved,
      s.sensitiveDataInvolved,
      s.dpiaStatus ?? '—',
      s.automatedDecisionConcern ? 'concern' : 'no',
    ])
  );

  out += '\n' + h('4. NIS2-relevant cybersecurity areas', 2);
  out += table(
    ['System', 'Flags'],
    nis2Rows(data).map((r) => [r.system.systemName, r.flags.join(', ')])
  );

  out += '\n' + h('5. AI security risks', 2);
  out += table(
    ['Risk', 'System', 'Severity', 'Status'],
    securityRelevantRisks(data).map((r) => [
      r.riskTitle,
      data.systems.find((s) => s.id === r.affectedAISystemId)?.systemName ?? '—',
      r.severity,
      r.status,
    ])
  );

  out += '\n' + h('6. Audit evidence gaps', 2);
  const buckets = auditEvidenceBuckets(data);
  out += list([
    `Missing / no review date: **${buckets.missing.length}**`,
    `Expired: **${buckets.expired.length}**`,
    `Due soon: **${buckets.dueSoon.length}**`,
    `Fresh: **${buckets.fresh.length}**`,
  ]);
  out += '\n' + h('Evidence needing attention', 3);
  out += table(
    ['Evidence', 'Type', 'Owner', 'Status'],
    [...buckets.missing, ...buckets.expired].map((e) => [e.evidenceTitle, e.evidenceType, e.owner || '—', e.status])
  );

  out += '\n' + h('7. Vendor risk', 2);
  out += table(
    ['Vendor', 'Dependency', 'Privacy', 'Security', 'DPA'],
    (data.vendors ?? []).map((v) => [v.vendorName, v.vendorDependencyRisk, v.privacyReviewStatus, v.securityReviewStatus, v.dpaStatus])
  );

  out += '\n' + h('8. Management summary', 2);
  const stats = dashboardStats(data);
  out += list([
    `Active AI systems: **${stats.totalSystems}** · possible high-risk: **${stats.possibleHighRisk}**`,
    `Open high/critical risks: **${stats.openHighRisks + stats.openCriticalRisks}** · open incidents: **${stats.openIncidents}**`,
    `Overdue reviews: **${stats.overdueReviews}** · audit-readiness evidence coverage: **${stats.coveragePct}%**`,
  ]);

  out += '\n' + h('9. Disclaimer', 2);
  out += `${DISCLAIMER}\n`;
  return out;
}

/* ------------------------------------------------------------------ */
/* 9. Vendor Risk Summary Report                                       */
/* ------------------------------------------------------------------ */

export function vendorRiskSummaryReport(data: WorkspaceData): string {
  const vendors = data.vendors ?? [];
  let out = h('Vendor Risk Summary Report') + meta(data, 'Vendor Risk Summary Report') + '\n';
  out += h('Vendors', 2);
  out += table(
    ['Vendor', 'Type', 'Region', 'Linked systems', 'Personal', 'Sensitive', 'Dependency'],
    vendors.map((v) => [
      v.vendorName,
      v.serviceType,
      v.region || '—',
      v.linkedAISystemIds.map((id) => systemName(data, id)).join(', ') || '—',
      v.personalDataShared,
      v.sensitiveDataShared,
      v.vendorDependencyRisk,
    ])
  );
  out += '\n' + h('Review status', 2);
  out += table(
    ['Vendor', 'Contract', 'Privacy', 'Security', 'DPA', 'Review date'],
    vendors.map((v) => [
      v.vendorName,
      v.contractReviewStatus,
      v.privacyReviewStatus,
      v.securityReviewStatus,
      v.dpaStatus,
      formatDate(v.reviewDate),
    ])
  );
  const pending = vendorReviewsPending(data);
  out += '\n' + h('Vendor reviews pending', 2);
  out += list(pending.map((v) => `${v.vendorName} — owner: ${v.owner || '—'}`));
  return out;
}

/* ------------------------------------------------------------------ */
/* 10. Open Actions Report                                             */
/* ------------------------------------------------------------------ */

export function openActionsReport(data: WorkspaceData): string {
  let out = h('Open Actions Report') + meta(data, 'Open Actions Report') + '\n';

  out += h('Open gap actions', 2);
  const gaps = (data.gapActions ?? [])
    .filter((g) => g.status !== 'done' && g.status !== 'accepted-risk')
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  out += table(
    ['Action', 'System', 'Severity', 'Status', 'Owner', 'Due'],
    gaps.map((g) => [g.title, systemName(data, g.affectedAISystemId), g.severity, g.status, g.owner || '—', formatDate(g.dueDate)])
  );

  out += '\n' + h('Overdue reviews', 2);
  const overdue = reviewItems(data).filter((r) => r.state === 'overdue');
  out += table(
    ['Type', 'Item', 'Owner', 'Due'],
    overdue.map((r) => [r.kind, r.title, r.owner || '—', relativeReview(r.date)])
  );

  out += '\n' + h('Open high / critical risks', 2);
  const risks = data.risks
    .filter((r) => isOpenRisk(r) && (r.severity === 'high' || r.severity === 'critical'))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  out += table(
    ['Risk', 'System', 'Severity', 'Owner'],
    risks.map((r) => [r.riskTitle, systemName(data, r.affectedAISystemId), r.severity, r.owner || '—'])
  );

  out += '\n' + h('Open incidents', 2);
  const incidents = data.incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed');
  out += table(
    ['Incident', 'System', 'Severity', 'Status', 'Owner'],
    incidents.map((i) => [i.incidentTitle, systemName(data, i.affectedAISystemId), i.severity, i.status, i.owner || '—'])
  );

  out += '\n' + h('Pending intake reviews', 2);
  const intake = (data.useCases ?? []).filter((u) => u.status.startsWith('needs-') || u.status === 'submitted');
  out += table(
    ['Request', 'Status', 'Requester', 'Target go-live'],
    intake.map((u) => [u.requestTitle, u.status, u.requester || '—', formatDate(u.targetGoLiveDate)])
  );
  return out;
}

/* ------------------------------------------------------------------ */
/* 11. GDPR-Relevant Privacy Review Summary                            */
/* ------------------------------------------------------------------ */

export function gdprPrivacyReviewSummaryReport(data: WorkspaceData): string {
  const systems = gdprSystems(data);
  let out = h('GDPR-Relevant Privacy Review Summary') + meta(data, 'GDPR-Relevant Privacy Review Summary') + '\n';
  out += '> GDPR-relevant privacy review view. High-level organization only — not legal advice or a privacy determination.\n\n';

  out += h('Systems processing personal / sensitive data', 2);
  out += table(
    ['System', 'Personal', 'Sensitive', 'Automated decision', 'DPIA', 'Privacy review'],
    systems.map((s) => [
      s.systemName,
      s.personalDataInvolved,
      s.sensitiveDataInvolved,
      s.automatedDecisionConcern ? 'concern' : 'no',
      s.dpiaStatus ?? '—',
      s.privacyReviewNeeded ? 'recommended' : 'not flagged',
    ])
  );

  out += '\n' + h('Processing details', 2);
  for (const s of systems) {
    out += `\n### ${s.systemName}\n`;
    out += list([
      `Data subjects: ${s.dataSubjects || '—'}`,
      `Data categories: ${s.personalDataCategories || '—'}`,
      `Purpose: ${s.businessPurpose || '—'}`,
      `Recipients / vendors: ${s.recipientsOrVendors || s.vendorOrProvider || '—'}`,
      `Retention note: ${s.retentionPeriod || '—'}`,
      `International transfer: ${s.internationalTransferFlag ? 'yes' : 'no / unknown'}`,
    ]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 12. AI Security Risk Summary                                        */
/* ------------------------------------------------------------------ */

export function aiSecurityRiskSummaryReport(data: WorkspaceData): string {
  const risks = securityRelevantRisks(data);
  let out = h('AI Security Risk Summary') + meta(data, 'AI Security Risk Summary') + '\n';
  out += '> AI security risks inspired by OWASP LLM Top 10 / MITRE ATLAS. Indicative organization only.\n\n';

  out += h('Risk areas (reference)', 2);
  out += list(AI_SECURITY_CATEGORIES.map((c) => `**${c.name}** — ${c.hint}`));

  out += '\n' + h('Security-relevant risks', 2);
  out += table(
    ['Risk', 'System', 'Severity', 'Status', 'Controls', 'Evidence', 'Owner'],
    risks.map((r) => [
      r.riskTitle,
      systemName(data, r.affectedAISystemId),
      r.severity,
      r.status,
      String(r.linkedControlIds.length),
      String(r.linkedEvidenceIds.length),
      r.owner || '—',
    ])
  );

  const incidents = data.incidents.filter((i) =>
    risks.some((r) => i.relatedRiskIds.includes(r.id))
  );
  if (incidents.length) {
    out += '\n' + h('Related incidents', 2);
    out += table(
      ['Incident', 'System', 'Severity', 'Status'],
      incidents.map((i) => [i.incidentTitle, systemName(data, i.affectedAISystemId), i.severity, i.status])
    );
  }
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
    description: 'Portfolio status, pending reviews, evidence coverage, and open gap actions.',
    generate: auditReadinessReport,
  },
  {
    id: 'gap-report',
    title: 'Control & Evidence Gap',
    description: 'Controls missing evidence, per-system evidence gaps, and open gap actions.',
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
    description: 'Leadership summary of portfolio status, risk, evidence, incidents, and priority gaps.',
    generate: managementOverviewReport,
  },
  {
    id: 'framework-lens-summary',
    title: 'Framework Lens Summary',
    description: 'AI Act, ISO 42001, GDPR, NIS2, AI security, and audit-evidence views in one summary.',
    generate: frameworkLensSummaryReport,
  },
  {
    id: 'vendor-risk-summary',
    title: 'Vendor Risk Summary',
    description: 'Vendors with data shared, review statuses, dependency risk, and pending reviews.',
    generate: vendorRiskSummaryReport,
  },
  {
    id: 'open-actions',
    title: 'Open Actions',
    description: 'Open gap actions, overdue reviews, open high/critical risks, incidents, and pending intake.',
    generate: openActionsReport,
  },
  {
    id: 'gdpr-privacy-summary',
    title: 'GDPR-Relevant Privacy Review Summary',
    description: 'Systems with personal/sensitive data: data subjects, categories, retention, DPIA status.',
    generate: gdprPrivacyReviewSummaryReport,
  },
  {
    id: 'ai-security-summary',
    title: 'AI Security Risk Summary',
    description: 'AI security risks inspired by OWASP LLM Top 10 / MITRE ATLAS, with linked controls and incidents.',
    generate: aiSecurityRiskSummaryReport,
  },
];
