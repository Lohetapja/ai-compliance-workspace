import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { AIRisk } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Modal } from '../components/ui/Modal';
import { Chip } from '../components/ui/Chip';
import { SeverityChip, RiskStatusChip, ReviewChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { sortRisksBySeverity, systemName } from '../lib/selectors';
import { RiskForm } from '../components/forms/RiskForm';
import { blankRisk } from '../data/factories';
import { RISK_TEMPLATES, riskFromTemplate } from '../data/templates';

export function RiskRegisterPage() {
  const data = useStore((s) => s.data);
  const [editing, setEditing] = useState<AIRisk | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('');
  const [status, setStatus] = useState('');
  const [sysId, setSysId] = useState('');

  const rows = useMemo(() => {
    const filtered = data.risks.filter((r) => {
      if (q && !`${r.riskTitle} ${r.riskDescription} ${r.owner} ${r.riskCategory}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (sev && r.severity !== sev) return false;
      if (status && r.status !== status) return false;
      if (sysId && r.affectedAISystemId !== sysId) return false;
      return true;
    });
    return sortRisksBySeverity(filtered);
  }, [data.risks, q, sev, status, sysId]);

  const columns: Column<AIRisk>[] = [
    {
      header: 'Risk',
      primary: true,
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{r.riskTitle}</div>
          <div className="truncate text-xs text-faint">{systemName(data, r.affectedAISystemId)} · {r.riskCategory}</div>
        </div>
      ),
    },
    { header: 'Severity', cell: (r) => <SeverityChip value={r.severity} /> },
    { header: 'L / I', cell: (r) => <span className="text-xs text-muted capitalize">{r.likelihood} / {r.impact}</span> },
    { header: 'Status', cell: (r) => <RiskStatusChip value={r.status} /> },
    { header: 'Owner', cell: (r) => <span className="text-xs text-muted">{r.owner || '—'}</span> },
    {
      header: 'Review',
      cell: (r) => {
        const st = reviewState(r.reviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="AI Risk Register"
        description="AI-specific risks with likelihood, impact and treatment status. Severity is derived from likelihood × impact."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowTemplates(true)}>
              <Icon name="copy" size={14} /> Templates
            </Button>
            <Button variant="primary" onClick={() => setEditing(blankRisk())}>
              <Icon name="plus" /> New risk
            </Button>
          </div>
        }
      />

      {data.risks.length === 0 ? (
        <EmptyState
          icon="△"
          title="No risks yet"
          hint="Add AI-specific risks such as prompt injection, sensitive data leakage, hallucinated output, or bias. Use Templates to start from a common risk."
          action={
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setShowTemplates(true)}>Add from template</Button>
              <Button variant="secondary" onClick={() => setEditing(blankRisk())}>Blank risk</Button>
            </div>
          }
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search risks…"
            filters={[
              { label: 'Severity', value: sev, onChange: setSev, options: ['critical', 'high', 'medium', 'low'].map((v) => ({ value: v, label: v })) },
              { label: 'Status', value: status, onChange: setStatus, options: ['open', 'in-progress', 'mitigated', 'accepted', 'transferred', 'avoided', 'closed'].map((v) => ({ value: v, label: v })) },
              { label: 'System', value: sysId, onChange: setSysId, options: data.systems.map((s) => ({ value: s.id, label: s.systemName })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">No risks match these filters.</p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(r) => r.id} onRowClick={(r) => setEditing(r)} />
          )}
        </>
      )}

      {editing && <RiskForm initial={editing} onClose={() => setEditing(null)} />}

      {showTemplates && (
        <Modal open onClose={() => setShowTemplates(false)} title="Risk templates" subtitle="Pick a common AI risk to start from. You can edit everything before saving." size="lg">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RISK_TEMPLATES.map((t) => (
              <button
                key={t.riskTitle}
                onClick={() => { setShowTemplates(false); setEditing(riskFromTemplate(t)); }}
                className="rounded-lg border border-border bg-panel-2 p-3 text-left hover:border-border-strong hover:bg-elevated"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{t.riskTitle}</span>
                  <Chip tone="neutral">{t.riskCategory}</Chip>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-faint">{t.riskDescription}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
