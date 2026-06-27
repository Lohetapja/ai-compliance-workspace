import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { FilterBar } from '../components/ui/FilterBar';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Chip } from '../components/ui/Chip';
import { reviewState } from '../lib/dates';
import { isOpenRisk } from '../lib/selectors';

interface OwnerRow {
  owner: string;
  systems: number;
  risks: number;
  controls: number;
  evidence: number;
  decisions: number;
  incidents: number;
  vendors: number;
  openGaps: number;
  pendingIntake: number;
  overdue: number;
  highSeverity: number;
  total: number;
}

export function OwnersPage() {
  const data = useStore((s) => s.data);
  const [q, setQ] = useState('');
  const [overdueOnly, setOverdueOnly] = useState('');
  const [highOnly, setHighOnly] = useState('');

  const { rows, unassigned } = useMemo(() => {
    const map = new Map<string, OwnerRow>();
    const get = (owner: string): OwnerRow | null => {
      const name = (owner || '').trim();
      if (!name) return null;
      let r = map.get(name);
      if (!r) {
        r = { owner: name, systems: 0, risks: 0, controls: 0, evidence: 0, decisions: 0, incidents: 0, vendors: 0, openGaps: 0, pendingIntake: 0, overdue: 0, highSeverity: 0, total: 0 };
        map.set(name, r);
      }
      return r;
    };
    let unassigned = 0;
    const overdue = (date: string) => reviewState(date) === 'overdue';

    for (const s of data.systems) {
      const r = get(s.owner); if (!r) { unassigned++; continue; }
      r.systems++; r.total++; if (overdue(s.nextReviewDate)) r.overdue++;
    }
    for (const x of data.risks) {
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.risks++; r.total++; if (overdue(x.reviewDate)) r.overdue++;
      if (isOpenRisk(x) && (x.severity === 'high' || x.severity === 'critical')) r.highSeverity++;
    }
    for (const x of data.controls) {
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.controls++; r.total++; if (overdue(x.reviewDate)) r.overdue++;
    }
    for (const x of data.evidence) {
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.evidence++; r.total++; if (overdue(x.reviewDate)) r.overdue++;
    }
    for (const x of data.decisions) {
      const r = get(x.decisionOwner); if (!r) { unassigned++; continue; }
      r.decisions++; r.total++; if (overdue(x.nextReviewDate)) r.overdue++;
    }
    for (const x of data.incidents) {
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.incidents++; r.total++; if (overdue(x.reviewDate)) r.overdue++;
      if (x.severity === 'high' || x.severity === 'critical') r.highSeverity++;
    }
    for (const x of data.vendors ?? []) {
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.vendors++; r.total++; if (overdue(x.reviewDate)) r.overdue++;
    }
    for (const x of data.gapActions ?? []) {
      if (x.status === 'done' || x.status === 'accepted-risk') continue;
      const r = get(x.owner); if (!r) { unassigned++; continue; }
      r.openGaps++; r.total++; if (overdue(x.dueDate)) r.overdue++;
      if (x.severity === 'high' || x.severity === 'critical') r.highSeverity++;
    }
    for (const x of data.useCases ?? []) {
      const r = get(x.requester); if (!r) { unassigned++; continue; }
      if (x.status.startsWith('needs-') || x.status === 'submitted') r.pendingIntake++;
      r.total++;
    }

    return { rows: [...map.values()].sort((a, b) => b.total - a.total), unassigned };
  }, [data]);

  const filtered = rows.filter((r) => {
    if (q && !r.owner.toLowerCase().includes(q.toLowerCase())) return false;
    if (overdueOnly && r.overdue === 0) return false;
    if (highOnly && r.highSeverity === 0) return false;
    return true;
  });

  const ownersWithOverdue = rows.filter((r) => r.overdue > 0).length;
  const mostActive = rows.slice().sort((a, b) => (b.openGaps + b.overdue) - (a.openGaps + a.overdue))[0];

  const columns: Column<OwnerRow>[] = [
    { header: 'Owner', primary: true, cell: (r) => <span className="font-medium text-ink">{r.owner}</span> },
    { header: 'Systems', cell: (r) => <span className="text-xs text-muted">{r.systems}</span> },
    { header: 'Risks', cell: (r) => <span className="text-xs text-muted">{r.risks}</span> },
    { header: 'Controls', cell: (r) => <span className="text-xs text-muted">{r.controls}</span> },
    { header: 'Evidence', cell: (r) => <span className="text-xs text-muted">{r.evidence}</span> },
    { header: 'Vendors', cell: (r) => <span className="text-xs text-muted">{r.vendors}</span> },
    { header: 'Open gaps', cell: (r) => (r.openGaps ? <Chip tone="warn">{r.openGaps}</Chip> : <span className="text-faint">0</span>) },
    { header: 'Pending intake', cell: (r) => <span className="text-xs text-muted">{r.pendingIntake}</span> },
    { header: 'High sev', cell: (r) => (r.highSeverity ? <Chip tone="danger">{r.highSeverity}</Chip> : <span className="text-faint">0</span>) },
    { header: 'Overdue', cell: (r) => (r.overdue ? <Chip tone="danger">{r.overdue}</Chip> : <span className="text-faint">0</span>) },
  ];

  return (
    <>
      <PageHeader
        title="Owners & Responsibilities"
        description="Who owns what across the workspace. Based on owner names in the demo data — no user accounts. Makes cross-functional responsibility visible."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Owners with overdue items" value={ownersWithOverdue} tone={ownersWithOverdue ? 'danger' : 'ok'} />
        <StatCard label="Unassigned records" value={unassigned} tone={unassigned ? 'warn' : 'ok'} hint="Records with no owner" />
        <StatCard label="Most open actions" value={mostActive ? `${mostActive.owner}` : '—'} tone="info" hint={mostActive ? `${mostActive.openGaps + mostActive.overdue} open/overdue` : ''} />
      </div>

      <FilterBar
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search owners…"
        filters={[
          { label: 'Overdue', value: overdueOnly, onChange: setOverdueOnly, options: [{ value: 'yes', label: 'Overdue only' }] },
          { label: 'High severity', value: highOnly, onChange: setHighOnly, options: [{ value: 'yes', label: 'High severity only' }] },
        ]}
      />

      {filtered.length === 0 ? (
        <Card><p className="px-4 py-8 text-center text-sm text-faint">No owners match these filters.</p></Card>
      ) : (
        <DataTable rows={filtered} columns={columns} getKey={(r) => r.owner} />
      )}
    </>
  );
}
