import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { UseCaseIntake } from '../types';
import { INTAKE_STATUS_LABELS } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { IntakeStatusChip, ReviewChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { UseCaseForm } from '../components/forms/UseCaseForm';
import { blankUseCase } from '../data/factories';

const APPROVED = new Set(['approved-pilot', 'approved-production']);

export function UseCaseIntakePage() {
  const data = useStore((s) => s.data);
  const convert = useStore((s) => s.convertUseCaseToSystem);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<UseCaseIntake | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [useType, setUseType] = useState('');

  const items = data.useCases ?? [];
  const rows = useMemo(
    () =>
      [...items]
        .filter((u) => {
          if (q && !`${u.requestTitle} ${u.requester} ${u.businessUnit} ${u.businessPurpose}`.toLowerCase().includes(q.toLowerCase())) return false;
          if (status && u.status !== status) return false;
          if (useType && u.useType !== useType) return false;
          return true;
        })
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [items, q, status, useType]
  );

  function doConvert(u: UseCaseIntake) {
    if (u.convertedSystemId) {
      navigate(`/systems/${u.convertedSystemId}`);
      return;
    }
    if (confirm(`Create an AI System record from "${u.requestTitle}"? You can edit it afterwards.`)) {
      const id = convert(u.id);
      if (id) navigate(`/systems/${id}`);
    }
  }

  const columns: Column<UseCaseIntake>[] = [
    {
      header: 'Request',
      primary: true,
      cell: (u) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{u.requestTitle}</div>
          <div className="truncate text-xs text-faint">{u.requester || 'no requester'} · {u.businessUnit || '—'}</div>
        </div>
      ),
    },
    { header: 'Use type', cell: (u) => <span className="text-xs capitalize text-muted">{u.useType}</span> },
    { header: 'Status', cell: (u) => <IntakeStatusChip value={u.status} /> },
    {
      header: 'Go-live',
      cell: (u) => {
        const st = reviewState(u.targetGoLiveDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
    {
      header: 'Convert',
      cell: (u) =>
        APPROVED.has(u.status) ? (
          <Button size="sm" variant={u.convertedSystemId ? 'ghost' : 'secondary'} onClick={(e) => { e.stopPropagation(); doConvert(u); }}>
            {u.convertedSystemId ? 'View system' : 'Convert to system'}
          </Button>
        ) : (
          <span className="text-xs text-faint">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Use Case Intake"
        description="Lightweight intake for proposed AI use cases. Triage which reviews are needed before a use case becomes a tracked AI system."
        actions={
          <Button variant="primary" onClick={() => setEditing(blankUseCase())}>
            <Icon name="plus" /> New intake
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-border bg-panel px-4 py-3 text-xs leading-relaxed text-muted">
        Intake records are a workflow aid for triage. Status flags such as &ldquo;needs legal review&rdquo;
        indicate where human review is recommended — they are not legal determinations.
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="◇"
          title="No intake requests yet"
          hint="Capture a proposed AI use case — who wants it, why, what data it touches, and which reviews it needs. Approved intakes can be converted into an AI System record."
          action={<Button variant="primary" onClick={() => setEditing(blankUseCase())}>Create intake</Button>}
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search intake requests…"
            filters={[
              { label: 'Status', value: status, onChange: setStatus, options: (Object.keys(INTAKE_STATUS_LABELS) as (keyof typeof INTAKE_STATUS_LABELS)[]).map((v) => ({ value: v, label: INTAKE_STATUS_LABELS[v] })) },
              { label: 'Use type', value: useType, onChange: setUseType, options: ['internal', 'external', 'both', 'customer-facing', 'unknown'].map((v) => ({ value: v, label: v })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">No intake requests match these filters.</p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(u) => u.id} onRowClick={(u) => setEditing(u)} />
          )}
        </>
      )}

      {editing && <UseCaseForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
