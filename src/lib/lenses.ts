import type {
  AIRisk,
  AISystem,
  Control,
  ControlCategory,
  Evidence,
  UseCaseIntake,
  Vendor,
  WorkspaceData,
} from '../types';
import { controlLacksEvidence, isOpenRisk } from './selectors';
import { evidenceFreshness } from './freshness';
import { isOverdue, reviewState } from './dates';

/**
 * Helpers for the Framework Lenses. These are high-level organizational views.
 * They do NOT determine compliance, provide legal advice, or reproduce
 * copyrighted standard text. All groupings are indicative only.
 */

export function activeSystems(data: WorkspaceData): AISystem[] {
  return data.systems.filter((s) => s.currentStatus !== 'archived');
}

/* ---- GDPR lens: systems touching personal / sensitive data ---- */
export function gdprSystems(data: WorkspaceData): AISystem[] {
  return activeSystems(data).filter(
    (s) => s.personalDataInvolved === 'yes' || s.sensitiveDataInvolved === 'yes'
  );
}

/* ---- ISO/IEC 42001-inspired management-system areas ---- */
export interface IsoArea {
  key: string;
  description: string;
  categories: ControlCategory[];
  controls: Control[];
  evidence: Evidence[];
  owner: string;
  status: 'no-controls' | 'needs-attention' | 'on-track';
  gapCount: number;
}

const ISO_AREA_DEFS: { key: string; description: string; categories: ControlCategory[] }[] = [
  { key: 'AI governance policy', description: 'A documented AI governance position and scope.', categories: ['Governance'] },
  { key: 'Roles and responsibilities', description: 'Named owners and accountability for AI systems.', categories: ['Accountability'] },
  { key: 'AI risk assessment', description: 'A process to assess AI risks before and during use.', categories: ['Risk Management'] },
  { key: 'Impact assessment', description: 'Privacy / rights impact considered where relevant.', categories: ['Privacy / GDPR'] },
  { key: 'Documented information', description: 'System, data and model documentation is maintained.', categories: ['Documentation'] },
  { key: 'Supplier / third-party AI controls', description: 'Third-party model/providers are assessed.', categories: ['Vendor / Third-party Risk'] },
  { key: 'Monitoring and review', description: 'Performance and drift are monitored in production.', categories: ['Logging & Monitoring'] },
  { key: 'Continual improvement', description: 'Changes are managed and improvements tracked.', categories: ['Change Management'] },
  { key: 'Human oversight', description: 'A human can review, override, or stop the system.', categories: ['Human Oversight'] },
  { key: 'Internal audit readiness', description: 'Evidence is organized for review/audit.', categories: ['Audit Readiness'] },
];

export function iso42001Areas(data: WorkspaceData): IsoArea[] {
  return ISO_AREA_DEFS.map((def) => {
    const controls = data.controls.filter((c) => def.categories.includes(c.controlCategory));
    const evidenceIds = new Set(controls.flatMap((c) => c.linkedEvidenceIds));
    const evidence = data.evidence.filter((e) => evidenceIds.has(e.id));
    const gapCount = controls.filter(
      (c) => c.status !== 'implemented' || controlLacksEvidence(c, data)
    ).length;
    const owner = controls.find((c) => c.owner)?.owner ?? '';
    const status: IsoArea['status'] =
      controls.length === 0 ? 'no-controls' : gapCount === 0 ? 'on-track' : 'needs-attention';
    return { ...def, controls, evidence, owner, status, gapCount };
  });
}

/* ---- AI security lens: OWASP LLM Top 10-inspired categories ---- */
export const AI_SECURITY_CATEGORIES: { name: string; hint: string }[] = [
  { name: 'Prompt injection', hint: 'Untrusted input manipulates model behaviour or tool use.' },
  { name: 'Insecure output handling', hint: 'Model output is trusted by downstream systems without checks.' },
  { name: 'Training data poisoning', hint: 'Malicious or low-quality data corrupts behaviour.' },
  { name: 'Model denial of service', hint: 'Resource-heavy requests degrade availability.' },
  { name: 'Supply chain vulnerability', hint: 'Compromised dependencies, base models, or datasets.' },
  { name: 'Sensitive information disclosure', hint: 'Sensitive data leaks via prompts, logs, tools, or outputs.' },
  { name: 'Insecure plugin/tool design', hint: 'Tools/plugins perform unsafe actions.' },
  { name: 'Excessive agency', hint: 'More autonomy/permissions than the task requires.' },
  { name: 'Overreliance', hint: 'Users trust outputs without verification.' },
  { name: 'Model theft', hint: 'Proprietary weights or behaviour are extracted.' },
  { name: 'Misuse / abuse', hint: 'The system is used for prohibited purposes.' },
];

export function securityRelevantRisks(data: WorkspaceData): AIRisk[] {
  return data.risks.filter(
    (r) =>
      r.frameworkTags.includes('OWASP LLM Top 10') ||
      r.frameworkTags.includes('MITRE ATLAS') ||
      r.riskCategory === 'AI security'
  );
}

/* ---- Audit evidence lens ---- */
export interface EvidenceBuckets {
  missing: Evidence[];
  expired: Evidence[];
  dueSoon: Evidence[];
  fresh: Evidence[];
}

export function auditEvidenceBuckets(data: WorkspaceData): EvidenceBuckets {
  const buckets: EvidenceBuckets = { missing: [], expired: [], dueSoon: [], fresh: [] };
  for (const e of data.evidence) {
    const f = evidenceFreshness(e);
    if (e.status === 'missing' || f === 'missing-review-date') buckets.missing.push(e);
    else if (f === 'expired') buckets.expired.push(e);
    else if (f === 'due-soon') buckets.dueSoon.push(e);
    else buckets.fresh.push(e);
  }
  return buckets;
}

/* ---- Vendor / intake helpers ---- */
export function vendorReviewsPending(data: WorkspaceData): Vendor[] {
  return (data.vendors ?? []).filter(
    (v) =>
      [v.contractReviewStatus, v.privacyReviewStatus, v.securityReviewStatus, v.dpaStatus].some(
        (s) => s === 'not-started' || s === 'in-progress'
      ) || isOverdue(v.reviewDate)
  );
}

const PENDING_INTAKE = new Set([
  'submitted',
  'needs-security-review',
  'needs-privacy-review',
  'needs-legal-review',
  'needs-product-review',
]);

export function pendingIntakes(data: WorkspaceData): UseCaseIntake[] {
  return (data.useCases ?? []).filter((u) => PENDING_INTAKE.has(u.status));
}

/* ---- Dashboard counts for the new views ---- */
export function lensCounts(data: WorkspaceData) {
  const buckets = auditEvidenceBuckets(data);
  return {
    vendorReviewsPending: vendorReviewsPending(data).length,
    intakePending: pendingIntakes(data).length,
    expiredEvidence: buckets.expired.length,
    evidenceDueSoon: buckets.dueSoon.length,
    aiActReviewAreas: activeSystems(data).filter(
      (s) => s.riskCategory === 'high-review-needed' || s.legalReviewNeeded
    ).length,
    gdprSystems: gdprSystems(data).length,
    securityRisks: securityRelevantRisks(data).filter(isOpenRisk).length,
  };
}

/* ---- AI Act lens buckets ---- */
export interface AiActBucket {
  key: string;
  label: string;
  systems: AISystem[];
}

export function aiActBuckets(data: WorkspaceData): AiActBucket[] {
  const sys = activeSystems(data);
  const linkedEvidenceForSystem = (s: AISystem) =>
    data.evidence.some((e) => e.linkedAISystemIds.includes(s.id));
  const openIncidentSystemIds = new Set(
    data.incidents
      .filter((i) => i.status !== 'resolved' && i.status !== 'closed')
      .map((i) => i.affectedAISystemId)
  );
  const openHighRiskSystemIds = new Set(
    data.risks
      .filter((r) => isOpenRisk(r) && (r.severity === 'high' || r.severity === 'critical'))
      .map((r) => r.affectedAISystemId)
  );
  return [
    { key: 'high', label: 'Possible elevated-risk context', systems: sys.filter((s) => s.riskCategory === 'high-review-needed' || s.riskCategory === 'elevated') },
    { key: 'legal', label: 'Legal review recommended', systems: sys.filter((s) => s.legalReviewNeeded) },
    { key: 'transparency', label: 'Transparency review area (customer-facing)', systems: sys.filter((s) => s.customerFacing) },
    { key: 'oversight', label: 'Human oversight to confirm', systems: sys.filter((s) => !s.humanOversightOwner || s.humanOversightReviewNeeded) },
    { key: 'logging', label: 'Logging / audit trail to confirm', systems: sys.filter((s) => s.loggingEnabled !== 'yes' || s.auditTrailAvailable !== 'yes') },
    { key: 'evidence', label: 'Documentation / evidence to add', systems: sys.filter((s) => !linkedEvidenceForSystem(s)) },
    { key: 'incidents', label: 'Open incidents', systems: sys.filter((s) => openIncidentSystemIds.has(s.id)) },
    { key: 'risks', label: 'Open high / critical risks', systems: sys.filter((s) => openHighRiskSystemIds.has(s.id)) },
  ];
}

/* ---- NIS2 lens system flags ---- */
export interface Nis2Row {
  system: AISystem;
  flags: string[];
}

export function nis2Rows(data: WorkspaceData): Nis2Row[] {
  const openIncidentSystemIds = new Set(
    data.incidents
      .filter((i) => i.status !== 'resolved' && i.status !== 'closed')
      .map((i) => i.affectedAISystemId)
  );
  return activeSystems(data)
    .map((s) => {
      const flags: string[] = [];
      if (s.customerFacing) flags.push('Customer-facing');
      if (s.deploymentEnvironment.toLowerCase().includes('production')) flags.push('Production');
      if (s.securityReviewNeeded) flags.push('Security review');
      if (s.loggingEnabled !== 'yes') flags.push('Missing logging');
      if (s.auditTrailAvailable !== 'yes') flags.push('Missing audit trail');
      if (openIncidentSystemIds.has(s.id)) flags.push('Open incident');
      if (s.vendorReviewNeeded) flags.push('Vendor dependency');
      if (reviewState(s.nextReviewDate) === 'overdue') flags.push('Overdue review');
      return { system: s, flags };
    })
    .filter((r) => r.flags.length > 0);
}
