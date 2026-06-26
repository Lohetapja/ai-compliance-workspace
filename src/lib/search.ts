import type { EntityKind, WorkspaceData } from '../types';

export interface SearchResult {
  kind: EntityKind;
  id: string;
  title: string;
  subtitle: string;
  /** Route to navigate to (hash route path). */
  to: string;
}

const KIND_ROUTE: Record<EntityKind, string> = {
  system: '/systems',
  risk: '/risks',
  control: '/controls',
  evidence: '/controls',
  decision: '/decisions',
  incident: '/incidents',
};

function hay(...parts: (string | string[] | undefined)[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : [p ?? '']))
    .join(' ')
    .toLowerCase();
}

/** Lightweight substring search across every collection. */
export function searchWorkspace(
  data: WorkspaceData,
  query: string
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const s of data.systems) {
    if (
      hay(
        s.systemName,
        s.description,
        s.owner,
        s.businessUnit,
        s.vendorOrProvider,
        s.frameworkTags
      ).includes(q)
    )
      results.push({
        kind: 'system',
        id: s.id,
        title: s.systemName || 'Untitled system',
        subtitle: `AI System · ${s.owner || 'no owner'}`,
        to: `/systems/${s.id}`,
      });
  }
  for (const r of data.risks) {
    if (
      hay(r.riskTitle, r.riskDescription, r.owner, r.riskCategory, r.frameworkTags).includes(
        q
      )
    )
      results.push({
        kind: 'risk',
        id: r.id,
        title: r.riskTitle || 'Untitled risk',
        subtitle: `Risk · ${r.severity} · ${r.owner || 'no owner'}`,
        to: KIND_ROUTE.risk,
      });
  }
  for (const c of data.controls) {
    if (hay(c.controlTitle, c.purpose, c.owner, c.controlCategory, c.frameworkTags).includes(q))
      results.push({
        kind: 'control',
        id: c.id,
        title: c.controlTitle || 'Untitled control',
        subtitle: `Control · ${c.controlCategory}`,
        to: KIND_ROUTE.control,
      });
  }
  for (const e of data.evidence) {
    if (hay(e.evidenceTitle, e.description, e.owner, e.evidenceType, e.frameworkTags).includes(q))
      results.push({
        kind: 'evidence',
        id: e.id,
        title: e.evidenceTitle || 'Untitled evidence',
        subtitle: `Evidence · ${e.evidenceType}`,
        to: KIND_ROUTE.evidence,
      });
  }
  for (const d of data.decisions) {
    if (hay(d.decisionTitle, d.decisionSummary, d.decisionOwner, d.reason).includes(q))
      results.push({
        kind: 'decision',
        id: d.id,
        title: d.decisionTitle || 'Untitled decision',
        subtitle: `Decision · ${d.decisionOwner || 'no owner'}`,
        to: KIND_ROUTE.decision,
      });
  }
  for (const i of data.incidents) {
    if (hay(i.incidentTitle, i.description, i.owner, i.type).includes(q))
      results.push({
        kind: 'incident',
        id: i.id,
        title: i.incidentTitle || 'Untitled incident',
        subtitle: `Incident · ${i.type} · ${i.severity}`,
        to: KIND_ROUTE.incident,
      });
  }

  return results.slice(0, 40);
}
