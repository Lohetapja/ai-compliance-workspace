import type { AISystem, Evidence, WorkspaceData } from '../types';

/**
 * "Evidence Coverage" — deliberately NOT a compliance score.
 * It only reports how much of the *selected, expected* evidence has been
 * documented. We base it on the recommended evidence checklist below.
 */

/**
 * Recommended evidence types we look for per AI system (a checklist, not a rule).
 * Several items only apply to higher-exposure systems, so the denominator stays
 * proportionate — a simple internal tool is not expected to have everything.
 */
export const RECOMMENDED_EVIDENCE: { type: string; appliesIf?: (s: AISystem) => boolean }[] = [
  { type: 'AI system description' },
  { type: 'Risk assessment' },
  { type: 'Data source description' },
  {
    type: 'DPIA / privacy assessment note',
    appliesIf: (s) => s.personalDataInvolved === 'yes' || s.sensitiveDataInvolved === 'yes',
  },
  {
    type: 'Human oversight plan',
    appliesIf: (s) => s.humanReviewRequired === 'yes' || s.autonomyLevel !== 'advisory',
  },
  { type: 'Logging configuration' },
  {
    type: 'Monitoring plan',
    appliesIf: (s) => s.customerFacing || s.internalOrExternalUse !== 'internal' || s.autonomyLevel !== 'advisory',
  },
  {
    type: 'Incident response process',
    appliesIf: (s) => s.customerFacing || s.internalOrExternalUse !== 'internal',
  },
  {
    type: 'Security review notes',
    appliesIf: (s) => s.customerFacing || s.personalDataInvolved === 'yes' || s.internalOrExternalUse !== 'internal',
  },
  {
    type: 'Vendor assessment',
    appliesIf: (s) => !!s.vendorOrProvider && s.openSourceOrCommercial !== 'in-house',
  },
];

const PRESENT_STATUSES = new Set(['available', 'reviewed']);

function systemHasEvidenceType(
  system: AISystem,
  type: string,
  evidence: Evidence[]
): boolean {
  return evidence.some(
    (e) =>
      e.evidenceType === type &&
      e.linkedAISystemIds.includes(system.id) &&
      PRESENT_STATUSES.has(e.status)
  );
}

export interface SystemCoverage {
  systemId: string;
  expected: number;
  documented: number;
  missingTypes: string[];
  pct: number;
}

export function systemCoverage(system: AISystem, data: WorkspaceData): SystemCoverage {
  const applicable = RECOMMENDED_EVIDENCE.filter(
    (r) => !r.appliesIf || r.appliesIf(system)
  );
  const missingTypes: string[] = [];
  let documented = 0;
  for (const r of applicable) {
    if (systemHasEvidenceType(system, r.type, data.evidence)) documented++;
    else missingTypes.push(r.type);
  }
  const expected = applicable.length;
  return {
    systemId: system.id,
    expected,
    documented,
    missingTypes,
    pct: expected === 0 ? 0 : Math.round((documented / expected) * 100),
  };
}

export interface WorkspaceCoverage {
  expected: number;
  documented: number;
  pct: number;
  perSystem: SystemCoverage[];
}

export function workspaceCoverage(data: WorkspaceData): WorkspaceCoverage {
  const active = data.systems.filter((s) => s.currentStatus !== 'archived');
  const perSystem = active.map((s) => systemCoverage(s, data));
  const expected = perSystem.reduce((n, c) => n + c.expected, 0);
  const documented = perSystem.reduce((n, c) => n + c.documented, 0);
  return {
    expected,
    documented,
    pct: expected === 0 ? 0 : Math.round((documented / expected) * 100),
    perSystem,
  };
}

export const COVERAGE_DISCLAIMER =
  'Evidence Coverage is not a compliance score. It only shows how much of the ' +
  'recommended evidence checklist has been documented for the AI systems.';

/* ------------------------------------------------------------------ */
/* Missing-evidence / gap warnings for a single system                 */
/* ------------------------------------------------------------------ */

export interface Gap {
  severity: 'warn' | 'info';
  message: string;
}

export function systemGaps(system: AISystem, data: WorkspaceData): Gap[] {
  const gaps: Gap[] = [];
  const cov = systemCoverage(system, data);

  const linkedRisks = data.risks.filter((r) => r.affectedAISystemId === system.id);
  const linkedControls = data.controls.filter((c) =>
    c.affectedAISystemIds.includes(system.id)
  );
  const openGapActions = (data.gapActions ?? []).filter(
    (g) =>
      g.affectedAISystemId === system.id &&
      g.status !== 'done' &&
      g.status !== 'accepted-risk'
  );
  const openIncidents = data.incidents.filter(
    (i) => i.affectedAISystemId === system.id && i.status !== 'resolved' && i.status !== 'closed'
  );

  // Review date hygiene
  if (!system.nextReviewDate)
    gaps.push({ severity: 'warn', message: 'Missing next review date.' });

  // Evidence checklist gaps (the high-signal ones get their own friendly label)
  const friendly: Record<string, string> = {
    'Risk assessment': 'Missing risk assessment.',
    'Human oversight plan': 'Missing human oversight plan.',
    'Vendor assessment': 'Missing vendor review / assessment.',
    'Logging configuration': 'Missing logging evidence.',
    'Data source description': 'Missing data source description.',
    'DPIA / privacy assessment note': 'Missing privacy / DPIA note.',
    'Incident response process': 'Missing incident response evidence.',
  };
  for (const t of cov.missingTypes) {
    gaps.push({ severity: 'warn', message: friendly[t] ?? `Missing evidence: ${t}.` });
  }

  // Review-flag follow-ups
  if (system.legalReviewNeeded)
    gaps.push({ severity: 'info', message: 'Legal review flagged — not yet recorded as closed.' });
  if (system.privacyReviewNeeded && system.personalDataInvolved === 'yes')
    gaps.push({ severity: 'info', message: 'Privacy review flagged with personal data involved.' });
  if (system.securityReviewNeeded)
    gaps.push({ severity: 'info', message: 'Security review flagged.' });
  if (system.vendorReviewNeeded)
    gaps.push({ severity: 'info', message: 'Vendor review flagged.' });
  if (system.humanOversightReviewNeeded)
    gaps.push({ severity: 'info', message: 'Human-oversight review flagged.' });
  if (system.personalDataInvolved === 'yes' && !system.privacyReviewNeeded)
    gaps.push({ severity: 'warn', message: 'Personal data involved; privacy review should be considered.' });
  if (system.customerFacing && system.loggingEnabled !== 'yes')
    gaps.push({ severity: 'warn', message: 'Customer-facing system without confirmed logging.' });

  // Structural gaps
  if (linkedRisks.length === 0)
    gaps.push({ severity: 'info', message: 'No risks recorded for this system yet.' });
  if (linkedControls.length === 0)
    gaps.push({ severity: 'info', message: 'No controls linked to this system yet.' });
  if (!system.humanOversightOwner && system.autonomyLevel !== 'advisory')
    gaps.push({ severity: 'warn', message: 'Missing human-oversight owner.' });
  if (system.loggingEnabled === 'no')
    gaps.push({ severity: 'warn', message: 'Logging is not enabled.' });
  if (system.auditTrailAvailable === 'no')
    gaps.push({ severity: 'warn', message: 'No audit trail available.' });
  if (linkedRisks.some((r) => ['open', 'in-progress'].includes(r.status) && (r.severity === 'high' || r.severity === 'critical')))
    gaps.push({ severity: 'warn', message: 'Open high or critical risk linked to this system.' });
  if (openIncidents.length)
    gaps.push({ severity: 'warn', message: 'Open incident or issue linked to this system.' });
  if (openGapActions.length)
    gaps.push({ severity: 'info', message: `${openGapActions.length} open gap action(s) linked to this system.` });

  return gaps;
}
