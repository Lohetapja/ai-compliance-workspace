/**
 * Core data models for the AI Compliance Workspace.
 *
 * These types describe the entire governance "case" model: AI systems and the
 * risks, controls, evidence, decisions and incidents linked to them. Everything
 * is plain JSON so the whole workspace can be exported/imported as a single file
 * and persisted in the browser (localStorage). No backend, no server schema.
 */

export type ID = string;
/** ISO date string, e.g. "2026-03-01" or full ISO timestamp. */
export type ISODate = string;

/* ------------------------------------------------------------------ */
/* Shared enums / vocabularies                                         */
/* ------------------------------------------------------------------ */

export type RiskCategory =
  | 'unassessed'
  | 'minimal'
  | 'limited'
  | 'elevated'
  | 'high-review-needed';

// Deliberately careful, non-legal wording. "Possible High-Risk Area" never
// asserts a legal high-risk determination — it points to where legal review is advised.
export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  unassessed: 'Unknown',
  minimal: 'Minimal / Low',
  limited: 'Limited',
  elevated: 'Elevated',
  'high-review-needed': 'Possible High-Risk Area',
};

export type SystemStatus =
  | 'draft'
  | 'in-review'
  | 'approved'
  | 'active'
  | 'needs-review'
  | 'paused'
  | 'retired'
  | 'archived';

export const SYSTEM_STATUS_LABELS: Record<SystemStatus, string> = {
  draft: 'Draft',
  'in-review': 'In Review',
  approved: 'Approved',
  active: 'Active',
  'needs-review': 'Needs Review',
  paused: 'Paused',
  retired: 'Retired',
  archived: 'Archived',
};

export type AutonomyLevel = 'advisory' | 'semi-autonomous' | 'autonomous';

export type Likelihood = 'low' | 'medium' | 'high';
export type Impact = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type RiskStatus =
  | 'open'
  | 'in-progress'
  | 'mitigated'
  | 'accepted'
  | 'transferred'
  | 'avoided'
  | 'closed';

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  mitigated: 'Mitigated',
  accepted: 'Accepted',
  transferred: 'Transferred',
  avoided: 'Avoided',
  closed: 'Closed',
};

export type ControlStatus =
  | 'not-started'
  | 'planned'
  | 'implemented'
  | 'needs-review'
  | 'missing-evidence'
  | 'retired';

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  'not-started': 'Not Started',
  planned: 'Planned',
  implemented: 'Implemented',
  'needs-review': 'Needs Review',
  'missing-evidence': 'Missing Evidence',
  retired: 'Retired',
};

export type EvidenceStatus =
  | 'missing'
  | 'draft'
  | 'available'
  | 'reviewed'
  | 'expired';

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  missing: 'Missing',
  draft: 'Draft',
  available: 'Available',
  reviewed: 'Reviewed',
  expired: 'Expired',
};

export type ControlCategory =
  | 'Governance'
  | 'Accountability'
  | 'Risk Management'
  | 'Data Governance'
  | 'Human Oversight'
  | 'Transparency'
  | 'Security'
  | 'Access Control'
  | 'Logging & Monitoring'
  | 'Incident Response'
  | 'Vendor / Third-party Risk'
  | 'Model Evaluation'
  | 'Bias / Fairness Testing'
  | 'Documentation'
  | 'Change Management'
  | 'Audit Readiness'
  | 'User Communication'
  | 'Privacy / GDPR'
  | 'Business Continuity'
  | 'Secure AI Development'
  | 'Abuse / Misuse Prevention';

export const CONTROL_CATEGORIES: ControlCategory[] = [
  'Governance',
  'Accountability',
  'Risk Management',
  'Data Governance',
  'Human Oversight',
  'Transparency',
  'Security',
  'Access Control',
  'Logging & Monitoring',
  'Incident Response',
  'Vendor / Third-party Risk',
  'Model Evaluation',
  'Bias / Fairness Testing',
  'Documentation',
  'Change Management',
  'Audit Readiness',
  'User Communication',
  'Privacy / GDPR',
  'Business Continuity',
  'Secure AI Development',
  'Abuse / Misuse Prevention',
];

export type RiskTreatment =
  | 'accepted'
  | 'mitigated'
  | 'transferred'
  | 'avoided'
  | 'deferred';

export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'contained'
  | 'resolved'
  | 'closed';

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  contained: 'Contained',
  resolved: 'Resolved',
  closed: 'Closed',
};

export type GapActionStatus =
  | 'open'
  | 'in-progress'
  | 'blocked'
  | 'done'
  | 'accepted-risk';

export const GAP_ACTION_STATUS_LABELS: Record<GapActionStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  'accepted-risk': 'Accepted Risk',
};

export type GapType =
  | 'Missing evidence'
  | 'Missing owner'
  | 'Missing review date'
  | 'Missing human oversight'
  | 'Missing logging'
  | 'Missing audit trail'
  | 'Missing vendor review'
  | 'Missing privacy review'
  | 'Missing security review'
  | 'Missing incident process'
  | 'Missing monitoring plan';

export const GAP_TYPES: GapType[] = [
  'Missing evidence',
  'Missing owner',
  'Missing review date',
  'Missing human oversight',
  'Missing logging',
  'Missing audit trail',
  'Missing vendor review',
  'Missing privacy review',
  'Missing security review',
  'Missing incident process',
  'Missing monitoring plan',
];

/** High-level framework identifiers. Mapping is intentionally coarse. */
export type FrameworkId =
  | 'EU AI Act'
  | 'ISO/IEC 42001'
  | 'ISO/IEC 27001'
  | 'GDPR'
  | 'NIS2'
  | 'NIST AI RMF'
  | 'OWASP LLM Top 10'
  | 'MITRE ATLAS'
  | 'SOC 2';

export const FRAMEWORKS: FrameworkId[] = [
  'EU AI Act',
  'ISO/IEC 42001',
  'ISO/IEC 27001',
  'GDPR',
  'NIS2',
  'NIST AI RMF',
  'OWASP LLM Top 10',
  'MITRE ATLAS',
  'SOC 2',
];

export type RequirementArea =
  | 'Governance'
  | 'Risk Management'
  | 'Documentation'
  | 'Data Governance'
  | 'Privacy'
  | 'Security'
  | 'Access Control'
  | 'Logging'
  | 'Monitoring'
  | 'Incident Response'
  | 'Human Oversight'
  | 'Transparency'
  | 'Vendor Risk'
  | 'Audit Readiness'
  | 'Business Continuity'
  | 'Change Management'
  | 'Model Evaluation'
  | 'Misuse Prevention';

export const REQUIREMENT_AREAS: RequirementArea[] = [
  'Governance',
  'Risk Management',
  'Documentation',
  'Data Governance',
  'Privacy',
  'Security',
  'Access Control',
  'Logging',
  'Monitoring',
  'Incident Response',
  'Human Oversight',
  'Transparency',
  'Vendor Risk',
  'Audit Readiness',
  'Business Continuity',
  'Change Management',
  'Model Evaluation',
  'Misuse Prevention',
];

/** Optional yes / no / unknown — used widely where "we don't know yet" matters. */
export type Tri = 'yes' | 'no' | 'unknown';

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */

export interface AISystem {
  id: ID;
  systemName: string;
  description: string;
  businessPurpose: string;
  owner: string;
  businessUnit: string;
  userGroups: string;
  internalOrExternalUse: 'internal' | 'external' | 'both' | 'unknown';
  customerFacing: boolean;
  modelType: string;
  vendorOrProvider: string;
  openSourceOrCommercial: 'open-source' | 'commercial' | 'in-house' | 'mixed' | 'unknown';
  deploymentEnvironment: string;
  deploymentRegion: string;
  dataUsed: string;
  personalDataInvolved: Tri;
  sensitiveDataInvolved: Tri;
  dataSources: string;
  dataProvenanceKnown: Tri;
  trainingDataUsed: string;
  inferenceDataUsed: string;
  humanOversightOwner: string;
  humanReviewRequired: Tri;
  autonomyLevel: AutonomyLevel;
  loggingEnabled: Tri;
  auditTrailAvailable: Tri;
  monitoringEnabled: Tri;
  currentStatus: SystemStatus;
  riskCategory: RiskCategory;
  legalReviewNeeded: boolean;
  privacyReviewNeeded: boolean;
  securityReviewNeeded: boolean;
  vendorReviewNeeded: boolean;
  humanOversightReviewNeeded: boolean;
  nextReviewDate: ISODate | '';
  lastReviewDate: ISODate | '';
  frameworkTags: FrameworkId[];
  /** Persisted output of the most recent Risk Classification Helper run. */
  classification?: ClassificationResult;
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AIRisk {
  id: ID;
  riskTitle: string;
  riskDescription: string;
  affectedAISystemId: ID | '';
  riskCategory: string;
  likelihood: Likelihood;
  impact: Impact;
  /** Derived from likelihood × impact, but stored so it can be exported. */
  severity: Severity;
  owner: string;
  mitigation: string;
  linkedControlIds: ID[];
  linkedEvidenceIds: ID[];
  status: RiskStatus;
  reviewDate: ISODate | '';
  residualRisk: string;
  notes: string;
  frameworkTags: FrameworkId[];
  requirementArea?: RequirementArea;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Control {
  id: ID;
  controlTitle: string;
  controlCategory: ControlCategory;
  purpose: string;
  affectedAISystemIds: ID[];
  owner: string;
  status: ControlStatus;
  evidenceRequired: boolean;
  linkedEvidenceIds: ID[];
  linkedRiskIds: ID[];
  frameworkTags: FrameworkId[];
  requirementArea?: RequirementArea;
  reviewDate: ISODate | '';
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Evidence {
  id: ID;
  evidenceTitle: string;
  evidenceType: string;
  description: string;
  owner: string;
  linkedAISystemIds: ID[];
  linkedControlIds: ID[];
  linkedRiskIds: ID[];
  fileReferenceOrUrlOrNote: string;
  status: EvidenceStatus;
  reviewDate: ISODate | '';
  frameworkTags: FrameworkId[];
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Decision {
  id: ID;
  decisionTitle: string;
  date: ISODate | '';
  decisionOwner: string;
  affectedAISystemId: ID | '';
  decisionSummary: string;
  reason: string;
  evidenceUsed: string;
  riskTreatment: RiskTreatment;
  reviewers: string;
  nextReviewDate: ISODate | '';
  linkedRiskIds: ID[];
  linkedControlIds: ID[];
  linkedEvidenceIds: ID[];
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Incident {
  id: ID;
  incidentTitle: string;
  affectedAISystemId: ID | '';
  severity: Severity;
  type: string;
  detectionTime: ISODate | '';
  description: string;
  impact: string;
  containment: string;
  rootCause: string;
  evidence: string;
  relatedRiskIds: ID[];
  followUpActions: string;
  status: IncidentStatus;
  lessonsLearned: string;
  owner: string;
  reviewDate: ISODate | '';
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface GapAction {
  id: ID;
  title: string;
  description: string;
  affectedAISystemId: ID | '';
  gapType: GapType;
  severity: Severity;
  owner: string;
  dueDate: ISODate | '';
  status: GapActionStatus;
  linkedControlId: ID | '';
  linkedEvidenceId: ID | '';
  linkedRiskId: ID | '';
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Risk Classification Helper                                          */
/* ------------------------------------------------------------------ */

export interface ClassificationAnswers {
  [questionId: string]: Tri;
}

export interface ClassificationResult {
  suggestedCategory: RiskCategory;
  /** Human-readable, deliberately non-legal summary line. */
  summary: string;
  reviewFlags: {
    legal: boolean;
    privacy: boolean;
    security: boolean;
    vendor: boolean;
    humanOversight: boolean;
  };
  reasons: string[];
  recommendedActions: string[];
  answers: ClassificationAnswers;
  ranAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Framework mapping (high-level, editable notes per framework area)   */
/* ------------------------------------------------------------------ */

export interface FrameworkNote {
  id: ID;
  framework: FrameworkId;
  requirementArea: RequirementArea;
  notes: string;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Whole-workspace document (this is what gets exported/imported)      */
/* ------------------------------------------------------------------ */

export interface WorkspaceData {
  systems: AISystem[];
  risks: AIRisk[];
  controls: Control[];
  evidence: Evidence[];
  decisions: Decision[];
  incidents: Incident[];
  gapActions: GapAction[];
  frameworkNotes: FrameworkNote[];
  organizationName: string;
}

export interface WorkspaceExport {
  app: 'ai-compliance-workspace';
  version: number;
  exportedAt: ISODate;
  data: WorkspaceData;
}

export type EntityKind =
  | 'system'
  | 'risk'
  | 'control'
  | 'evidence'
  | 'decision'
  | 'incident'
  | 'gapAction';
