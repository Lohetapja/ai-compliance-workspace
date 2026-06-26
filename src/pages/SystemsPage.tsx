import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { AISystem } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Chip } from '../components/ui/Chip';
import { RiskCategoryChip, SystemStatusChip, ReviewChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { systemCoverage } from '../lib/coverage';
import { SystemForm } from '../components/forms/SystemForm';
import { blankSystem } from '../data/factories';

export function SystemsPage() {
  const data = useStore((s) => s.data);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<AISystem | null>(null);
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [flag, setFlag] = useState('');

  const owners = useMemo(
    () => [...new Set(data.systems.map((s) => s.owner).filter(Boolean))].sort(),
    [data.systems]
  );

  const rows = useMemo(() => {
    return data.systems.filter((s) => {
      if (q && !`${s.systemName} ${s.description} ${s.owner} ${s.vendorOrProvider}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (risk && s.riskCategory !== risk) return false;
      if (status && s.currentStatus !== status) return false;
      if (owner && s.owner !== owner) return false;
      if (flag === 'legal' && !s.legalReviewNeeded) return false;
      if (flag === 'privacy' && !s.privacyReviewNeeded) return false;
      if (flag === 'security' && !s.securityReviewNeeded) return false;
      if (flag === 'vendor' && !s.vendorReviewNeeded) return false;
      if (flag === 'customer' && !s.customerFacing) return false;
      if (flag === 'personal' && s.personalDataInvolved !== 'yes') return false;
      if (flag === 'overdue' && reviewState(s.nextReviewDate) !== 'overdue') return false;
      if (flag === 'missing-evidence' && systemCoverage(s, data).missingTypes.length === 0) return false;
      return true;
    });
  }, [data, q, risk, status, owner, flag]);

  const columns: Column<AISystem>[] = [
    {
      header: 'System',
      primary: true,
      cell: (s) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{s.systemName}</div>
          <div className="truncate text-[11px] text-faint">
            {s.owner || 'No owner'} · {s.businessUnit || '—'}
          </div>
        </div>
      ),
    },
    { header: 'Status', cell: (s) => <SystemStatusChip value={s.currentStatus} /> },
    { header: 'Risk band', cell: (s) => <RiskCategoryChip value={s.riskCategory} /> },
    {
      header: 'Flags',
      cell: (s) => {
        const flags = [
          s.customerFacing && 'Cust',
          s.personalDataInvolved === 'yes' && 'PII',
          s.legalReviewNeeded && 'Legal',
          s.privacyReviewNeeded && 'Privacy',
          s.securityReviewNeeded && 'Security',
          s.vendorReviewNeeded && 'Vendor',
        ].filter(Boolean) as string[];
        return (
          <div className="flex flex-wrap justify-end gap-1 md:justify-start">
            {flags.length === 0 ? <span className="text-faint">—</span> : flags.map((f) => <Chip key={f} tone="neutral">{f}</Chip>)}
          </div>
        );
      },
    },
    {
      header: 'Next review',
      cell: (s) => {
        const st = reviewState(s.nextReviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="AI Systems"
        description="Inventory of AI systems: what they are, who owns them, what data they use, and what review they need."
        actions={
          <Button variant="primary" onClick={() => setEditing(blankSystem())}>
            <Icon name="plus" /> New system
          </Button>
        }
      />

      {data.systems.length === 0 ? (
        <EmptyState
          icon="◳"
          title="No AI systems yet"
          hint="Add an internal chatbot, a model deployment API, an AI training pipeline, or a document summarizer. Or load the fictional sample company."
          action={
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setEditing(blankSystem())}>Add a system</Button>
              <Button variant="secondary" onClick={loadSampleData}>Load sample data</Button>
            </div>
          }
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search systems…"
            filters={[
              {
                label: 'Risk',
                value: risk,
                onChange: setRisk,
                options: [
                  { value: 'high-review-needed', label: 'Possible high-risk area' },
                  { value: 'elevated', label: 'Elevated' },
                  { value: 'limited', label: 'Limited' },
                  { value: 'minimal', label: 'Minimal / Low' },
                  { value: 'unassessed', label: 'Unknown' },
                ],
              },
              {
                label: 'Status',
                value: status,
                onChange: setStatus,
                options: ['draft', 'in-review', 'approved', 'active', 'needs-review', 'paused', 'retired', 'archived'].map((v) => ({ value: v, label: v })),
              },
              { label: 'Owner', value: owner, onChange: setOwner, options: owners.map((o) => ({ value: o, label: o })) },
              {
                label: 'Flag',
                value: flag,
                onChange: setFlag,
                options: [
                  { value: 'legal', label: 'Legal review' },
                  { value: 'privacy', label: 'Privacy review' },
                  { value: 'security', label: 'Security review' },
                  { value: 'vendor', label: 'Vendor review' },
                  { value: 'customer', label: 'Customer-facing' },
                  { value: 'personal', label: 'Personal data' },
                  { value: 'overdue', label: 'Overdue review' },
                  { value: 'missing-evidence', label: 'Missing evidence' },
                ],
              },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">
              No systems match these filters.
            </p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(s) => s.id} onRowClick={(s) => navigate(`/systems/${s.id}`)} />
          )}
        </>
      )}

      {editing && <SystemForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
