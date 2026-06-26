import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Decision } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Chip } from '../components/ui/Chip';
import { ReviewChip } from '../components/ui/statusChips';
import { formatDate, reviewState } from '../lib/dates';
import { systemName } from '../lib/selectors';
import { DecisionForm } from '../components/forms/DecisionForm';
import { blankDecision } from '../data/factories';
import { downloadText } from '../lib/download';

export function DecisionsPage() {
  const data = useStore((s) => s.data);
  const [editing, setEditing] = useState<Decision | null>(null);
  const [q, setQ] = useState('');
  const [treatment, setTreatment] = useState('');
  const [sysId, setSysId] = useState('');

  const rows = useMemo(
    () =>
      [...data.decisions]
        .filter((d) => {
          if (q && !`${d.decisionTitle} ${d.decisionSummary} ${d.decisionOwner} ${d.reason}`.toLowerCase().includes(q.toLowerCase())) return false;
          if (treatment && d.riskTreatment !== treatment) return false;
          if (sysId && d.affectedAISystemId !== sysId) return false;
          return true;
        })
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data.decisions, q, treatment, sysId]
  );

  const columns: Column<Decision>[] = [
    {
      header: 'Decision',
      primary: true,
      cell: (d) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{d.decisionTitle}</div>
          <div className="truncate text-[11px] text-faint">{systemName(data, d.affectedAISystemId)} · {d.decisionOwner || 'no owner'}</div>
        </div>
      ),
    },
    { header: 'Treatment', cell: (d) => <Chip tone="violet">{d.riskTreatment}</Chip> },
    { header: 'Date', cell: (d) => <span className="text-xs text-muted">{formatDate(d.date)}</span> },
    {
      header: 'Next review',
      cell: (d) => {
        const st = reviewState(d.nextReviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  function exportHistory() {
    let md = `# Decision History — ${data.organizationName}\n\n*Generated: ${new Date().toLocaleString()}*\n\n`;
    md += '> Working record of governance decisions. Not legal advice.\n\n';
    for (const d of rows) {
      md += `## ${d.decisionTitle}\n`;
      md += `- **Date:** ${formatDate(d.date)}\n- **Owner:** ${d.decisionOwner || '—'}\n- **System:** ${systemName(data, d.affectedAISystemId)}\n- **Treatment:** ${d.riskTreatment}\n- **Reviewers:** ${d.reviewers || '—'}\n- **Next review:** ${formatDate(d.nextReviewDate)}\n\n`;
      if (d.decisionSummary) md += `${d.decisionSummary}\n\n`;
      if (d.reason) md += `**Reason:** ${d.reason}\n\n`;
      if (d.evidenceUsed) md += `**Evidence used:** ${d.evidenceUsed}\n\n`;
    }
    downloadText('decision-history.md', md);
  }

  return (
    <>
      <PageHeader
        title="Decision Journal"
        description="Why choices were made, who reviewed them, what evidence was used, and when to revisit. Decision traceability is the backbone of audit readiness."
        actions={
          <div className="flex gap-2">
            {data.decisions.length > 0 && (
              <Button variant="secondary" onClick={exportHistory}><Icon name="download" size={14} /> Export</Button>
            )}
            <Button variant="primary" onClick={() => setEditing(blankDecision())}><Icon name="plus" /> New decision</Button>
          </div>
        }
      />

      {data.decisions.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No decisions recorded"
          hint="Record decisions like “approve system for production”, “require human confirmation before action”, or “accept residual risk with monitoring”. Link them to the system, risks and evidence used."
          action={<Button variant="primary" onClick={() => setEditing(blankDecision())}>Record a decision</Button>}
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search decisions…"
            filters={[
              { label: 'Treatment', value: treatment, onChange: setTreatment, options: ['accepted', 'mitigated', 'transferred', 'avoided', 'deferred'].map((v) => ({ value: v, label: v })) },
              { label: 'System', value: sysId, onChange: setSysId, options: data.systems.map((s) => ({ value: s.id, label: s.systemName })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">No decisions match these filters.</p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(d) => d.id} onRowClick={(d) => setEditing(d)} />
          )}
        </>
      )}

      {editing && <DecisionForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
