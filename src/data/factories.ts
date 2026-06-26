import type {
  AIRisk,
  AISystem,
  Control,
  Decision,
  Evidence,
  GapAction,
  Incident,
  UseCaseIntake,
  Vendor,
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
    dataSubjects: '',
    personalDataCategories: '',
    retentionPeriod: '',
    recipientsOrVendors: '',
    internationalTransferFlag: false,
    automatedDecisionConcern: false,
    dpiaNeeded: false,
    dpiaStatus: 'not-started',
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

export function blankGapAction(systemId = ''): GapAction {
  const ts = nowISO();
  return {
    id: newId('gap'),
    title: '',
    description: '',
    affectedAISystemId: systemId,
    gapType: 'Missing evidence',
    severity: 'medium',
    owner: '',
    dueDate: '',
    status: 'open',
    linkedControlId: '',
    linkedEvidenceId: '',
    linkedRiskId: '',
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

export function blankUseCase(): UseCaseIntake {
  const ts = nowISO();
  return {
    id: newId('uc'),
    requestTitle: '',
    requester: '',
    businessUnit: '',
    businessPurpose: '',
    intendedUsers: '',
    useType: 'internal',
    dataInvolved: '',
    personalData: 'unknown',
    sensitiveData: 'unknown',
    vendorOrProvider: '',
    autonomyLevel: 'advisory',
    expectedImpact: '',
    possibleHighRiskContext: 'unknown',
    securityReviewNeeded: false,
    privacyReviewNeeded: false,
    legalReviewNeeded: false,
    targetGoLiveDate: '',
    status: 'draft',
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

export function blankVendor(): Vendor {
  const ts = nowISO();
  return {
    id: newId('ven'),
    vendorName: '',
    serviceType: '',
    linkedAISystemIds: [],
    dataShared: '',
    personalDataShared: 'unknown',
    sensitiveDataShared: 'unknown',
    region: '',
    contractReviewStatus: 'not-started',
    privacyReviewStatus: 'not-started',
    securityReviewStatus: 'not-started',
    dpaStatus: 'not-started',
    subprocessorsKnown: 'unknown',
    exitRisk: 'medium',
    vendorDependencyRisk: 'medium',
    reviewDate: '',
    owner: '',
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  };
}

/** Map an approved intake request into a draft AI System record. */
export function systemFromUseCase(uc: UseCaseIntake): AISystem {
  const base = blankSystem();
  const customerFacing = uc.useType === 'customer-facing';
  const use: AISystem['internalOrExternalUse'] =
    uc.useType === 'customer-facing' ? 'external' : uc.useType;
  return {
    ...base,
    systemName: uc.requestTitle || 'Untitled system',
    description: uc.expectedImpact || uc.businessPurpose,
    businessPurpose: uc.businessPurpose,
    owner: uc.requester,
    businessUnit: uc.businessUnit,
    userGroups: uc.intendedUsers,
    internalOrExternalUse: use,
    customerFacing,
    vendorOrProvider: uc.vendorOrProvider,
    dataUsed: uc.dataInvolved,
    personalDataInvolved: uc.personalData,
    sensitiveDataInvolved: uc.sensitiveData,
    autonomyLevel: uc.autonomyLevel,
    currentStatus: 'in-review',
    riskCategory: uc.possibleHighRiskContext === 'yes' ? 'high-review-needed' : 'unassessed',
    legalReviewNeeded: uc.legalReviewNeeded,
    privacyReviewNeeded: uc.privacyReviewNeeded,
    securityReviewNeeded: uc.securityReviewNeeded,
    nextReviewDate: uc.targetGoLiveDate,
    notes: `Converted from intake request "${uc.requestTitle}".${uc.notes ? ' ' + uc.notes : ''}`,
  };
}
