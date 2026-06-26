import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { GapAction } from '../types';
import { GAP_TYPES } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar } from '../components/ui/FilterBar';
import { DataTable, type Column } from '../components/ui/DataTable';
import { GapActionStatusChip, ReviewChip, SeverityChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { blankGapAction } from '../data/factories';
import { GapActionForm } from '../components/forms/GapActionForm';

export function GapActionsPage() {
  const data = useStore((s) => s.data);
  const patchGapAction = useStore((s) => s.patchGapAction);
  const removeGapAction = useStore((s) => s.removeGapAction);
  const [editing, setEditing] = useState<GapAction | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [systemId, setSystemId] = useState('');
  const [gapType, setGapType] = useState('');

  const actions = data.gapActions ?? [];

  const rows = useMemo(
    () =>
      actions.filter((g) => {
        const system = data.systems.find((s) => s.id === g.affectedAISystemId);
        if (q && !`${g.title} ${g.description} ${g.owner} ${g.gapType} ${system?.systemName ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (status && g.status !== status) return false;
        if (severity && g.severity !== severity) return false;
        if (systemId && g.affectedAISystemId !== systemId) return false;
        if (gapType && g.gapType !== gapType) return false;
        return true;
      }),
    [actions, data.systems, q, status, severity, systemId, gapType]
  );

  const columns: Column<GapAction>[] = [
    {
      header: 'Gap action',
      primary: true,
      cell: (g) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{g.title}</div>
          <div className="truncate text-[11px] text-faint">
            {g.gapType} · {data.systems.find((s) => s.id === g.affectedAISystemId)?.systemName ?? 'No system linked'}
          </div>
        </div>
      ),
    },
    { header: 'Severity', cell: (g) => <SeverityChip value={g.severity} /> },
    { header: 'Status', cell: (g) => <GapActionStatusChip value={g.status} /> },
    { header: 'Owner', cell: (g) => <span className="text-xs text-muted">{g.owner || '—'}</span> },
    {
      header: 'Due',
      cell: (g) => g.dueDate ? <ReviewChip state={reviewState(g.dueDate)} /> : <span className="text-faint">—</span>,
    },
    {
      header: 'Quick actions',
      cell: (g) => (
        <div className="flex flex-wrap justify-end gap-1 md:justify-start">
          {g.status !== 'done' && (
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); patchGapAction(g.id, { status: 'done' }); }}>
              Done
            </Button>
          )}
          {g.status !== 'accepted-risk' && (
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); patchGapAction(g.id, { status: 'accepted-risk' }); }}>
              Accept risk
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); deleteAction(g); }}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  function deleteAction(g: GapAction) {
    if (confirm(`Delete gap action "${g.title}"?`)) removeGapAction(g.id);
  }

  return (
    <>
      <PageHeader
        title="Gap Actions"
        description="Track missing evidence, missing reviews, and other follow-up work. Gap actions help turn review warnings into owned tasks."
        actions={
          <Button variant="primary" onClick={() => setEditing(blankGapAction())}>
            <Icon name="plus" /> New gap action
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-border bg-panel px-4 py-3 text-xs leading-relaxed text-muted">
        Gap actions are workflow reminders for human review. They do not prove compliance or replace legal, privacy, or security assessment.
      </div>

      {actions.length === 0 ? (
        <EmptyState
          icon="△"
          title="No gap actions yet"
          hint="Create a gap action from this page or from an AI system detail page when evidence, ownership, review dates, or controls need follow-up."
          action={<Button variant="primary" onClick={() => setEditing(blankGapAction())}>Create gap action</Button>}
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search gap actions..."
            filters={[
              { label: 'Status', value: status, onChange: setStatus, options: ['open', 'in-progress', 'blocked', 'done', 'accepted-risk'].map((v) => ({ value: v, label: v })) },
              { label: 'Severity', value: severity, onChange: setSeverity, options: ['low', 'medium', 'high', 'critical'].map((v) => ({ value: v, label: v })) },
              { label: 'System', value: systemId, onChange: setSystemId, options: data.systems.map((s) => ({ value: s.id, label: s.systemName })) },
              { label: 'Gap type', value: gapType, onChange: setGapType, options: GAP_TYPES.map((t) => ({ value: t, label: t })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">
              No gap actions match these filters.
            </p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(g) => g.id} onRowClick={(g) => setEditing(g)} />
          )}
        </>
      )}

      {editing && (
        <GapActionForm
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
