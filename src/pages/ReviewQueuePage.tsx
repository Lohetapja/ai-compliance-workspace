import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { FilterBar } from '../components/ui/FilterBar';
import { ReviewChip } from '../components/ui/statusChips';
import { formatDate, relativeReview, reviewState, type ReviewState } from '../lib/dates';
import { systemName } from '../lib/selectors';
import type { Severity } from '../types';

type Kind = 'AI System' | 'Evidence' | 'Vendor' | 'Risk' | 'Control' | 'Gap Action' | 'Use Case';

interface QueueItem {
  id: string;
  kind: Kind;
  title: string;
  owner: string;
  system: string;
  date: string;
  state: ReviewState;
  status: string;
  severity?: Severity;
  to: string;
  legal: boolean;
  privacy: boolean;
  security: boolean;
}

export function ReviewQueuePage() {
  const data = useStore((s) => s.data);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [owner, setOwner] = useState('');
  const [sev, setSev] = useState('');

  const items = useMemo<QueueItem[]>(() => {
    const out: QueueItem[] = [];
    for (const s of data.systems) {
      if (s.currentStatus === 'archived') continue;
      out.push({
        id: s.id, kind: 'AI System', title: s.systemName, owner: s.owner, system: s.systemName,
        date: s.nextReviewDate, state: reviewState(s.nextReviewDate), status: s.currentStatus,
        to: `/systems/${s.id}`, legal: s.legalReviewNeeded, privacy: s.privacyReviewNeeded, security: s.securityReviewNeeded,
      });
    }
    for (const e of data.evidence) {
      out.push({
        id: e.id, kind: 'Evidence', title: e.evidenceTitle, owner: e.owner,
        system: e.linkedAISystemIds.map((id) => systemName(data, id)).join(', '),
        date: e.reviewDate, state: reviewState(e.reviewDate), status: e.status,
        to: '/controls', legal: false, privacy: false, security: false,
      });
    }
    for (const v of data.vendors ?? []) {
      out.push({
        id: v.id, kind: 'Vendor', title: v.vendorName, owner: v.owner,
        system: v.linkedAISystemIds.map((id) => systemName(data, id)).join(', '),
        date: v.reviewDate, state: reviewState(v.reviewDate), status: v.vendorDependencyRisk + ' dependency',
        to: '/vendors', legal: false, privacy: v.privacyReviewStatus !== 'complete' && v.privacyReviewStatus !== 'not-required',
        security: v.securityReviewStatus !== 'complete' && v.securityReviewStatus !== 'not-required',
      });
    }
    for (const r of data.risks) {
      if (r.status === 'closed') continue;
      out.push({
        id: r.id, kind: 'Risk', title: r.riskTitle, owner: r.owner, system: systemName(data, r.affectedAISystemId),
        date: r.reviewDate, state: reviewState(r.reviewDate), status: r.status, severity: r.severity,
        to: '/risks', legal: false, privacy: false, security: false,
      });
    }
    for (const c of data.controls) {
      if (c.status === 'retired') continue;
      out.push({
        id: c.id, kind: 'Control', title: c.controlTitle, owner: c.owner,
        system: c.affectedAISystemIds.map((id) => systemName(data, id)).join(', '),
        date: c.reviewDate, state: reviewState(c.reviewDate), status: c.status,
        to: '/controls', legal: false, privacy: false, security: false,
      });
    }
    for (const g of data.gapActions ?? []) {
      if (g.status === 'done' || g.status === 'accepted-risk') continue;
      out.push({
        id: g.id, kind: 'Gap Action', title: g.title, owner: g.owner, system: systemName(data, g.affectedAISystemId),
        date: g.dueDate, state: reviewState(g.dueDate), status: g.status, severity: g.severity,
        to: '/gap-actions', legal: false, privacy: false, security: false,
      });
    }
    for (const u of data.useCases ?? []) {
      if (u.status === 'rejected' || u.status === 'approved-production') continue;
      out.push({
        id: u.id, kind: 'Use Case', title: u.requestTitle, owner: u.requester, system: '—',
        date: u.targetGoLiveDate, state: reviewState(u.targetGoLiveDate), status: u.status,
        to: '/use-cases', legal: u.legalReviewNeeded, privacy: u.privacyReviewNeeded, security: u.securityReviewNeeded,
      });
    }
    return out;
  }, [data]);

  const owners = useMemo(() => [...new Set(items.map((i) => i.owner).filter(Boolean))].sort(), [items]);

  const filtered = items.filter((i) => {
    if (q && !`${i.title} ${i.owner} ${i.system} ${i.kind}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (kind && i.kind !== kind) return false;
    if (owner && i.owner !== owner) return false;
    if (sev && i.severity !== sev) return false;
    return true;
  });

  const groups: { key: string; label: string; tone: 'danger' | 'warn' | 'info' | 'neutral'; items: QueueItem[] }[] = [
    { key: 'overdue', label: 'Overdue', tone: 'danger', items: filtered.filter((i) => i.state === 'overdue') },
    { key: 'due7', label: 'Due in 7 days', tone: 'warn', items: filtered.filter((i) => i.state === 'due-7') },
    { key: 'due30', label: 'Due in 30 days', tone: 'info', items: filtered.filter((i) => i.state === 'due-30') },
    { key: 'missing', label: 'Missing review date', tone: 'neutral', items: filtered.filter((i) => i.state === 'none') },
    { key: 'legal', label: 'Needs legal review', tone: 'warn', items: filtered.filter((i) => i.legal) },
    { key: 'privacy', label: 'Needs privacy review', tone: 'warn', items: filtered.filter((i) => i.privacy) },
    { key: 'security', label: 'Needs security review', tone: 'warn', items: filtered.filter((i) => i.security) },
  ];

  return (
    <>
      <PageHeader
        title="Review Queue"
        description="What needs review soon or is overdue, across systems, evidence, vendors, risks, controls, gap actions, and intake. Governance work is time-based."
      />

      <FilterBar
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search review items…"
        filters={[
          { label: 'Type', value: kind, onChange: setKind, options: ['AI System', 'Evidence', 'Vendor', 'Risk', 'Control', 'Gap Action', 'Use Case'].map((v) => ({ value: v, label: v })) },
          { label: 'Owner', value: owner, onChange: setOwner, options: owners.map((o) => ({ value: o, label: o })) },
          { label: 'Severity', value: sev, onChange: setSev, options: ['critical', 'high', 'medium', 'low'].map((v) => ({ value: v, label: v })) },
        ]}
      />

      <div className="space-y-4">
        {groups.map((g) => (
          <Card key={g.key}>
            <CardHeader title={`${g.label} (${g.items.length})`} />
            {g.items.length === 0 ? (
              <p className="px-4 py-4 text-xs text-faint">Nothing here.</p>
            ) : (
              <div className="divide-y divide-border">
                {g.items.map((i) => (
                  <Link key={`${g.key}-${i.kind}-${i.id}`} to={i.to} className="flex flex-col gap-1 px-4 py-2.5 hover:bg-panel-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-ink">{i.title}</div>
                      <div className="truncate text-xs text-faint">
                        {i.kind} · {i.owner || 'no owner'}{i.system && i.system !== '—' ? ` · ${i.system}` : ''} · {i.status}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {i.severity && <Chip tone={i.severity === 'critical' || i.severity === 'high' ? 'danger' : 'neutral'}>{i.severity}</Chip>}
                      {i.date ? (
                        <span className="text-xs text-muted">{formatDate(i.date)} · {relativeReview(i.date)}</span>
                      ) : (
                        <span className="text-xs text-faint">no date</span>
                      )}
                      {i.state !== 'none' && <ReviewChip state={i.state} />}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
