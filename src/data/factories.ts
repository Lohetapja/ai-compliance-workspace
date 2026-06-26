import type {
  AIRisk,
  AISystem,
  Control,
  Decision,
  Evidence,
  Incident,
} from '../types';
import { computeSeverity } from '../lib/severity';
import { newId, nowISO } from '../lib/id';

/**
 * Factory functions create a fresh, fully-typed blank entity with sensible
 * defaults. Forms edit the returned draft and save it via the store's upsert.
 */

export function blankSystem(): AISystem {
  const ts = nowISO();
  return {
    id: newId('sys'),
    systemName: '',
    description: '',
    businessPurpose: '',
    owner: '',
    businessUnit: '',
    userGroups: '',
    internalOrExternalUse: 'internal',
    customerFacing: false,
    modelType: '',
    vendorOrProvider: '',
    openSourceOrCommercial: 'unknown',
    deploymentEnvironment: '',
    deploymentRegion: '',
    dataUsed: '',
    personalDataInvolved: 'unknown',
    sensitiveDataInvolved: 'unknown',
    dataSources: '',
    dataProvenanceKnown: 'unknown',
    trainingDataUsed: '',
    inferenceDataUsed: '',
    humanOversightOwner: '',
    humanReviewRequired: 'unknown',
    autonomyLevel: 'advisory',
    loggingEnabled: 'unknown',
    auditTrailAvailable: 'unknown',
    monitoringEnabled: 'unknown',
    currentStatus: 'draft',
    riskCategory: 'unassessed',
    legalReviewNeeded: false,
    privacyReviewNeeded: false,
    securityReviewNeeded: false,
    vendorReviewNeeded: false,
    humanOversightReviewNeeded: false,
    nextReviewDate: '',
    lastReviewDate: '',
    frameworkTags: [],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankRisk(systemId = ''): AIRisk {
  const ts = nowISO();
  return {
    id: newId('risk'),
    riskTitle: '',
    riskDescription: '',
    affectedAISystemId: systemId,
    riskCategory: 'AI security',
    likelihood: 'medium',
    impact: 'medium',
    severity: computeSeverity('medium', 'medium'),
    owner: '',
    mitigation: '',
    linkedControlIds: [],
    linkedEvidenceIds: [],
    status: 'open',
    reviewDate: '',
    residualRisk: '',
    notes: '',
    frameworkTags: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankControl(systemId = ''): Control {
  const ts = nowISO();
  return {
    id: newId('ctrl'),
    controlTitle: '',
    controlCategory: 'Governance',
    purpose: '',
    affectedAISystemIds: systemId ? [systemId] : [],
    owner: '',
    status: 'not-started',
    evidenceRequired: true,
    linkedEvidenceIds: [],
    linkedRiskIds: [],
    frameworkTags: [],
    reviewDate: '',
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankEvidence(systemId = ''): Evidence {
  const ts = nowISO();
  return {
    id: newId('evd'),
    evidenceTitle: '',
    evidenceType: 'AI system description',
    description: '',
    owner: '',
    linkedAISystemIds: systemId ? [systemId] : [],
    linkedControlIds: [],
    linkedRiskIds: [],
    fileReferenceOrUrlOrNote: '',
    status: 'draft',
    reviewDate: '',
    frameworkTags: [],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankDecision(systemId = ''): Decision {
  const ts = nowISO();
  return {
    id: newId('dec'),
    decisionTitle: '',
    date: nowISO().slice(0, 10),
    decisionOwner: '',
    affectedAISystemId: systemId,
    decisionSummary: '',
    reason: '',
    evidenceUsed: '',
    riskTreatment: 'mitigated',
    reviewers: '',
    nextReviewDate: '',
    linkedRiskIds: [],
    linkedControlIds: [],
    linkedEvidenceIds: [],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankIncident(systemId = ''): Incident {
  const ts = nowISO();
  return {
    id: newId('inc'),
    incidentTitle: '',
    affectedAISystemId: systemId,
    severity: 'medium',
    type: 'Prompt injection',
    detectionTime: nowISO().slice(0, 10),
    description: '',
    impact: '',
    containment: '',
    rootCause: '',
    evidence: '',
    relatedRiskIds: [],
    followUpActions: '',
    status: 'open',
    lessonsLearned: '',
    owner: '',
    reviewDate: '',
    createdAt: ts,
    updatedAt: ts,
  };
}
