import type {
  AIRisk,
  Control,
  EntityKind,
  RiskCategory,
  WorkspaceData,
} from '../types';
import { reviewState, type ReviewState } from './dates';
import { SEVERITY_ORDER } from './severity';
import { workspaceCoverage } from './coverage';

/** A unified "thing with a review date" used by review-tracking widgets. */
export interface ReviewItem {
  kind: EntityKind;
  id: string;
  title: string;
  date: string;
  state: ReviewState;
  owner: string;
}

export function reviewItems(data: WorkspaceData): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const s of data.systems) {
    if (s.currentStatus === 'archived') continue;
    if (s.nextReviewDate)
      items.push({
        kind: 'system',
        id: s.id,
        title: s.systemName,
        date: s.nextReviewDate,
        state: reviewState(s.nextReviewDate),
        owner: s.owner,
      });
  }
  for (const r of data.risks) {
    if (r.reviewDate && r.status !== 'closed')
      items.push({
        kind: 'risk',
        id: r.id,
        title: r.riskTitle,
        date: r.reviewDate,
        state: reviewState(r.reviewDate),
        owner: r.owner,
      });
  }
  for (const c of data.controls) {
    if (c.reviewDate && c.status !== 'retired')
      items.push({
        kind: 'control',
        id: c.id,
        title: c.controlTitle,
        date: c.reviewDate,
        state: reviewState(c.reviewDate),
        owner: c.owner,
      });
  }
  for (const e of data.evidence) {
    if (e.reviewDate)
      items.push({
        kind: 'evidence',
        id: e.id,
        title: e.evidenceTitle,
        date: e.reviewDate,
        state: reviewState(e.reviewDate),
        owner: e.owner,
      });
  }
  for (const d of data.decisions) {
    if (d.nextReviewDate)
      items.push({
        kind: 'decision',
        id: d.id,
        title: d.decisionTitle,
        date: d.nextReviewDate,
        state: reviewState(d.nextReviewDate),
        owner: d.decisionOwner,
      });
  }
  for (const i of data.incidents) {
    if (i.reviewDate && i.status !== 'closed')
      items.push({
        kind: 'incident',
        id: i.id,
        title: i.incidentTitle,
        date: i.reviewDate,
        state: reviewState(i.reviewDate),
        owner: i.owner,
      });
  }
  for (const g of data.gapActions ?? []) {
    if (g.dueDate && g.status !== 'done' && g.status !== 'accepted-risk')
      items.push({
        kind: 'gapAction',
        id: g.id,
        title: g.title,
        date: g.dueDate,
        state: reviewState(g.dueDate),
        owner: g.owner,
      });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

const OPEN_RISK_STATUSES = new Set(['open', 'in-progress']);

export function isOpenRisk(r: AIRisk): boolean {
  return OPEN_RISK_STATUSES.has(r.status);
}

/** A control "lacks evidence" if it requires evidence but has no usable evidence. */
export function controlLacksEvidence(c: Control, data: WorkspaceData): boolean {
  if (!c.evidenceRequired) return false;
  const usable = c.linkedEvidenceIds.some((id) => {
    const e = data.evidence.find((x) => x.id === id);
    return e && (e.status === 'available' || e.status === 'reviewed');
  });
  return !usable;
}

export interface DashboardStats {
  totalSystems: number;
  activeSystems: number;
  customerFacing: number;
  withPersonalData: number;
  withSensitiveData: number;
  byRiskCategory: Record<RiskCategory, number>;
  possibleHighRisk: number;
  legalReview: number;
  privacyReview: number;
  securityReview: number;
  vendorReview: number;
  humanOversightReview: number;
  openHighRisks: number;
  openCriticalRisks: number;
  overdueReviews: number;
  due7: number;
  due30: number;
  controlsWithoutEvidence: number;
  missingEvidenceCount: number;
  openIncidents: number;
  openGapActions: number;
  overdueGapActions: number;
  highSeverityGapActions: number;
  coveragePct: number;
  coverageDocumented: number;
  coverageExpected: number;
}

export function dashboardStats(data: WorkspaceData): DashboardStats {
  const active = data.systems.filter((s) => s.currentStatus !== 'archived');

  const byRiskCategory: Record<RiskCategory, number> = {
    unassessed: 0,
    minimal: 0,
    limited: 0,
    elevated: 0,
    'high-review-needed': 0,
  };
  for (const s of active) byRiskCategory[s.riskCategory]++;

  const reviews = reviewItems(data);
  const coverage = workspaceCoverage(data);
  const missingEvidenceCount = coverage.perSystem.reduce(
    (n, c) => n + c.missingTypes.length,
    0
  );

  const openRisks = data.risks.filter(isOpenRisk);
  const gapActions = data.gapActions ?? [];
  const openGapActions = gapActions.filter(
    (g) => g.status !== 'done' && g.status !== 'accepted-risk'
  );

  return {
    totalSystems: active.length,
    activeSystems: active.filter((s) => s.currentStatus === 'active').length,
    customerFacing: active.filter((s) => s.customerFacing).length,
    withPersonalData: active.filter((s) => s.personalDataInvolved === 'yes').length,
    withSensitiveData: active.filter((s) => s.sensitiveDataInvolved === 'yes').length,
    byRiskCategory,
    possibleHighRisk: byRiskCategory['high-review-needed'],
    legalReview: active.filter((s) => s.legalReviewNeeded).length,
    privacyReview: active.filter((s) => s.privacyReviewNeeded).length,
    securityReview: active.filter((s) => s.securityReviewNeeded).length,
    vendorReview: active.filter((s) => s.vendorReviewNeeded).length,
    humanOversightReview: active.filter((s) => s.humanOversightReviewNeeded).length,
    openHighRisks: openRisks.filter((r) => r.severity === 'high').length,
    openCriticalRisks: openRisks.filter((r) => r.severity === 'critical').length,
    overdueReviews: reviews.filter((r) => r.state === 'overdue').length,
    due7: reviews.filter((r) => r.state === 'due-7').length,
    due30: reviews.filter((r) => r.state === 'due-30').length,
    controlsWithoutEvidence: data.controls.filter((c) => controlLacksEvidence(c, data))
      .length,
    missingEvidenceCount,
    openIncidents: data.incidents.filter(
      (i) => i.status !== 'resolved' && i.status !== 'closed'
    ).length,
    openGapActions: openGapActions.length,
    overdueGapActions: openGapActions.filter((g) => reviewState(g.dueDate) === 'overdue').length,
    highSeverityGapActions: openGapActions.filter((g) => g.severity === 'high' || g.severity === 'critical').length,
    coveragePct: coverage.pct,
    coverageDocumented: coverage.documented,
    coverageExpected: coverage.expected,
  };
}

export interface SystemAttention {
  id: string;
  name: string;
  owner: string;
  reasons: string[];
}

/**
 * Systems that need attention, each with concrete reasons:
 * overdue review, legal review flagged, missing oversight owner, no logging,
 * no audit trail. Used by the dashboard "Needs Attention" panel.
 */
export function systemsNeedingAttention(data: WorkspaceData): SystemAttention[] {
  return data.systems
    .filter((s) => s.currentStatus !== 'archived')
    .map((s) => {
      const reasons: string[] = [];
      if (reviewState(s.nextReviewDate) === 'overdue') reasons.push('Overdue review');
      if (!s.nextReviewDate) reasons.push('No review date');
      if (s.legalReviewNeeded) reasons.push('Legal review');
      if (s.privacyReviewNeeded) reasons.push('Privacy review');
      if (s.securityReviewNeeded) reasons.push('Security review');
      if (s.vendorReviewNeeded) reasons.push('Vendor review');
      if (s.personalDataInvolved === 'yes' && !s.privacyReviewNeeded) reasons.push('Privacy review recommended');
      if (s.customerFacing && s.loggingEnabled !== 'yes') reasons.push('Customer-facing logging review');
      if (!s.humanOversightOwner) reasons.push('No oversight owner');
      if (s.humanReviewRequired === 'yes' && !s.humanOversightOwner) reasons.push('Human oversight owner needed');
      if (s.loggingEnabled !== 'yes') reasons.push('No logging');
      if (s.auditTrailAvailable !== 'yes') reasons.push('No audit trail');
      const openHighRisks = data.risks.filter(
        (r) => r.affectedAISystemId === s.id && isOpenRisk(r) && (r.severity === 'high' || r.severity === 'critical')
      );
      if (openHighRisks.length) reasons.push('Open high risk');
      const missingEvidence = workspaceCoverage(data).perSystem.find((c) => c.systemId === s.id)?.missingTypes.length ?? 0;
      if (missingEvidence) reasons.push('Evidence missing');
      const openIncidents = data.incidents.filter((i) => i.affectedAISystemId === s.id && i.status !== 'resolved' && i.status !== 'closed');
      if (openIncidents.length) reasons.push('Open incident');
      const openGaps = (data.gapActions ?? []).filter(
        (g) => g.affectedAISystemId === s.id && g.status !== 'done' && g.status !== 'accepted-risk'
      );
      if (openGaps.length) reasons.push('Open gap action');
      return { id: s.id, name: s.systemName, owner: s.owner, reasons };
    })
    .filter((x) => x.reasons.length > 0);
}

/** Sort risks by severity (critical first), then open status. */
export function sortRisksBySeverity(risks: AIRisk[]): AIRisk[] {
  return [...risks].sort(
    (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
  );
}

export function systemName(data: WorkspaceData, id: string): string {
  return data.systems.find((s) => s.id === id)?.systemName ?? '—';
}
