import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Incident } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Modal } from '../components/ui/Modal';
import { SeverityChip, IncidentStatusChip } from '../components/ui/statusChips';
import { formatDate } from '../lib/dates';
import { systemName } from '../lib/selectors';
import { IncidentForm } from '../components/forms/IncidentForm';
import { blankIncident } from '../data/factories';
import { INCIDENT_TYPES, incidentFromType } from '../data/templates';

export function IncidentsPage() {
  const data = useStore((s) => s.data);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('');
  const [status, setStatus] = useState('');
  const [sysId, setSysId] = useState('');

  const rows = useMemo(
    () =>
      [...data.incidents]
        .filter((i) => {
          if (q && !`${i.incidentTitle} ${i.description} ${i.owner} ${i.type}`.toLowerCase().includes(q.toLowerCase())) return false;
          if (sev && i.severity !== sev) return false;
          if (status && i.status !== status) return false;
          if (sysId && i.affectedAISystemId !== sysId) return false;
          return true;
        })
        .sort((a, b) => (b.detectionTime || '').localeCompare(a.detectionTime || '')),
    [data.incidents, q, sev, status, sysId]
  );

  const columns: Column<Incident>[] = [
    {
      header: 'Incident',
      primary: true,
      cell: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{i.incidentTitle}</div>
          <div className="truncate text-xs text-faint">{i.type} · {systemName(data, i.affectedAISystemId)}</div>
        </div>
      ),
    },
    { header: 'Severity', cell: (i) => <SeverityChip value={i.severity} /> },
    { header: 'Status', cell: (i) => <IncidentStatusChip value={i.status} /> },
    { header: 'Owner', cell: (i) => <span className="text-xs text-muted">{i.owner || '—'}</span> },
    { header: 'Detected', cell: (i) => <span className="text-xs text-muted">{formatDate(i.detectionTime)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Incidents / Issues"
        description="AI-specific incidents and issues: data leakage, prompt injection, harmful output, bias complaints, vendor outages, and more."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowTemplates(true)}><Icon name="copy" size={14} /> Templates</Button>
            <Button variant="primary" onClick={() => setEditing(blankIncident())}><Icon name="plus" /> New incident</Button>
          </div>
        }
      />

      {data.incidents.length === 0 ? (
        <EmptyState
          icon="◌"
          title="No incidents logged"
          hint="Log AI-specific incidents such as prompt injection, data leakage, harmful output, or a vendor outage. Capture impact, containment, root cause and lessons learned."
          action={<Button variant="primary" onClick={() => setShowTemplates(true)}>Log from template</Button>}
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder="Search incidents…"
            filters={[
              { label: 'Severity', value: sev, onChange: setSev, options: ['critical', 'high', 'medium', 'low'].map((v) => ({ value: v, label: v })) },
              { label: 'Status', value: status, onChange: setStatus, options: ['open', 'investigating', 'contained', 'resolved', 'closed'].map((v) => ({ value: v, label: v })) },
              { label: 'System', value: sysId, onChange: setSysId, options: data.systems.map((s) => ({ value: s.id, label: s.systemName })) },
            ]}
          />
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">No incidents match these filters.</p>
          ) : (
            <DataTable rows={rows} columns={columns} getKey={(i) => i.id} onRowClick={(i) => setEditing(i)} />
          )}
        </>
      )}

      {editing && <IncidentForm initial={editing} onClose={() => setEditing(null)} />}

      {showTemplates && (
        <Modal open onClose={() => setShowTemplates(false)} title="Incident templates" subtitle="Pick an incident type to start from." size="lg">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INCIDENT_TYPES.map((t) => (
              <button key={t} onClick={() => { setShowTemplates(false); setEditing(incidentFromType(t)); }} className="rounded-lg border border-border bg-panel-2 px-3 py-2.5 text-left text-sm text-ink hover:border-border-strong hover:bg-elevated">
                {t}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
