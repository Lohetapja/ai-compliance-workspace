import type { WorkspaceData } from '../types';

/** Minimal, dependency-free CSV builder with proper quoting. */
type Cell = string | number | boolean | null | undefined;

function csvCell(v: Cell): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(headers: string[], rows: Cell[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

function sysName(data: WorkspaceData, id: string): string {
  return data.systems.find((s) => s.id === id)?.systemName ?? '';
}

export interface CsvExportDef {
  id: string;
  title: string;
  generate: (data: WorkspaceData) => string;
}

export const CSV_EXPORTS: CsvExportDef[] = [
  {
    id: 'ai-systems',
    title: 'AI Systems',
    generate: (d) =>
      toCSV(
        ['Name', 'Owner', 'Business unit', 'Status', 'Risk band', 'Customer-facing', 'Personal data', 'Sensitive data', 'Vendor/provider', 'Next review'],
        d.systems.map((s) => [s.systemName, s.owner, s.businessUnit, s.currentStatus, s.riskCategory, s.customerFacing ? 'yes' : 'no', s.personalDataInvolved, s.sensitiveDataInvolved, s.vendorOrProvider, s.nextReviewDate])
      ),
  },
  {
    id: 'risks',
    title: 'Risks',
    generate: (d) =>
      toCSV(
        ['Title', 'System', 'Category', 'Likelihood', 'Impact', 'Severity', 'Status', 'Owner', 'Review date'],
        d.risks.map((r) => [r.riskTitle, sysName(d, r.affectedAISystemId), r.riskCategory, r.likelihood, r.impact, r.severity, r.status, r.owner, r.reviewDate])
      ),
  },
  {
    id: 'controls',
    title: 'Controls',
    generate: (d) =>
      toCSV(
        ['Title', 'Category', 'Status', 'Owner', 'Systems', 'Evidence required', 'Review date'],
        d.controls.map((c) => [c.controlTitle, c.controlCategory, c.status, c.owner, c.affectedAISystemIds.map((id) => sysName(d, id)).join('; '), c.evidenceRequired ? 'yes' : 'no', c.reviewDate])
      ),
  },
  {
    id: 'evidence',
    title: 'Evidence',
    generate: (d) =>
      toCSV(
        ['Title', 'Type', 'Status', 'Owner', 'Systems', 'Review date', 'Expiry date', 'Required for', 'Frameworks'],
        d.evidence.map((e) => [e.evidenceTitle, e.evidenceType, e.status, e.owner, e.linkedAISystemIds.map((id) => sysName(d, id)).join('; '), e.reviewDate, e.expiryDate ?? '', e.requiredFor ?? '', e.frameworkTags.join('; ')])
      ),
  },
  {
    id: 'gap-actions',
    title: 'Gap Actions',
    generate: (d) =>
      toCSV(
        ['Title', 'Gap type', 'System', 'Severity', 'Status', 'Owner', 'Due date'],
        (d.gapActions ?? []).map((g) => [g.title, g.gapType, sysName(d, g.affectedAISystemId), g.severity, g.status, g.owner, g.dueDate])
      ),
  },
  {
    id: 'use-cases',
    title: 'Use Case Intake',
    generate: (d) =>
      toCSV(
        ['Request', 'Requester', 'Business unit', 'Use type', 'Personal data', 'Sensitive data', 'Status', 'Target go-live', 'Legal', 'Privacy', 'Security'],
        (d.useCases ?? []).map((u) => [u.requestTitle, u.requester, u.businessUnit, u.useType, u.personalData, u.sensitiveData, u.status, u.targetGoLiveDate, u.legalReviewNeeded ? 'yes' : 'no', u.privacyReviewNeeded ? 'yes' : 'no', u.securityReviewNeeded ? 'yes' : 'no'])
      ),
  },
  {
    id: 'vendors',
    title: 'Vendors',
    generate: (d) =>
      toCSV(
        ['Vendor', 'Type', 'Region', 'Systems', 'Personal data', 'Sensitive data', 'Contract', 'Privacy', 'Security', 'DPA', 'Dependency', 'Review date', 'Owner'],
        (d.vendors ?? []).map((v) => [v.vendorName, v.serviceType, v.region, v.linkedAISystemIds.map((id) => sysName(d, id)).join('; '), v.personalDataShared, v.sensitiveDataShared, v.contractReviewStatus, v.privacyReviewStatus, v.securityReviewStatus, v.dpaStatus, v.vendorDependencyRisk, v.reviewDate, v.owner])
      ),
  },
  {
    id: 'incidents',
    title: 'Incidents',
    generate: (d) =>
      toCSV(
        ['Title', 'System', 'Type', 'Severity', 'Status', 'Owner', 'Detected'],
        d.incidents.map((i) => [i.incidentTitle, sysName(d, i.affectedAISystemId), i.type, i.severity, i.status, i.owner, i.detectionTime])
      ),
  },
  {
    id: 'decisions',
    title: 'Decisions',
    generate: (d) =>
      toCSV(
        ['Title', 'System', 'Owner', 'Date', 'Treatment', 'Reviewers', 'Next review'],
        d.decisions.map((x) => [x.decisionTitle, sysName(d, x.affectedAISystemId), x.decisionOwner, x.date, x.riskTreatment, x.reviewers, x.nextReviewDate])
      ),
  },
];
