import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Vendor } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Chip } from '../components/ui/Chip';
import { ReviewStatusChip, RiskLevelChip, ReviewChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { systemName } from '../lib/selectors';
import { VendorForm } from '../components/forms/VendorForm';
import { blankVendor } from '../data/factories';

export function VendorRegisterPage() {
  const data = useStore((s) => s.data);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');

  const items = data.vendors ?? [];
  const rows = useMemo(
    () =>
      items.filter((v) => {
        if (q && !`${v.vendorName} ${v.serviceType} ${v.owner} ${v.region}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (risk && v.vendorDependencyRisk !== risk) return false;
        return true;
      }),
    [items, q, risk]
  );

  const columns: Column<Vendor>[] = [
    {
      header: 'Vendor',
      primary: true,
      cell: (v) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{v.vendorName}</div>
          <div className="truncate text-xs text-faint">{v.serviceType || '—'} · {v.region || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Linked systems',
      cell: (v) => <span className="text-xs text-muted">{v.linkedAISystemIds.map((id) => systemName(data, id)).join(', ') || '—'}</span>,
    },
    {
      header: 'Data shared',
      cell: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.personalDataShared === 'yes' && <Chip tone="warn">Personal</Chip>}
          {v.sensitiveDataShared === 'yes' && <Chip tone="danger">Sensitive</Chip>}
          {v.personalDataShared !== 'yes' && v.sensitiveDataShared !== 'yes' && <span className="text-faint">—</span>}
        </div>
      ),
    },
    { header: 'Privacy', cell: (v) => <ReviewStatusChip value={v.privacyReviewStatus} /> },
    { header: 'Security', cell: (v) => <ReviewStatusChip value={v.securityReviewStatus} /> },
    { header: 'DPA', cell: (v) => <ReviewStatusChip value={v.dpaStatus} /> },
    { header: 'Dependency', cell: (v) => <RiskLevelChip value={v.vendorDependencyRisk} /> },
    {
      header: 'Review',
      cell: (v) => {
        const st = reviewState(v.reviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Vendor Register"
        description="Third-party AI providers and the reviews they require: contract, privacy, security, DPA, and dependency risk."
        actions={
          <Button variant="primary" onClick={() => setEditing(blankVendor())}>
            <Icon name="plus" /> New vendor
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-border bg-panel px-4 py-3 text-xs leading-relaxed text-muted">
        Sample vendors use generic placeholder names only. Vendor review statuses are workflow trackers, not assurances.
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="▤"
          title="No vendors yet"
          hint="Add third-party AI/model/cloud providers as generic placeholders (e.g. Demo Foundation Model Provider). Track contract, privacy, security, and DPA review status."
          action={<Button variant="primary" onClick={() => setEditing(blankVendor())}>Add vendor</Button>}
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search vendors…"
            filters={[
              { label: 'Dependency risk', value: risk, onChange: setRisk, options: ['high', 'medium', 'low'].map((v) => ({ value: v, label: v })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">No vendors match these filters.</p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(v) => v.id} onRowClick={(v) => setEditing(v)} />
          )}
        </>
      )}

      {editing && <VendorForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
