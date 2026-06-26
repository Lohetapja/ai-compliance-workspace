import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import type { Control, Evidence } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Modal } from '../components/ui/Modal';
import { Chip } from '../components/ui/Chip';
import { ControlStatusChip, EvidenceStatusChip, ReviewChip } from '../components/ui/statusChips';
import { reviewState } from '../lib/dates';
import { controlLacksEvidence } from '../lib/selectors';
import { cn } from '../components/ui/cn';
import { ControlForm } from '../components/forms/ControlForm';
import { EvidenceForm } from '../components/forms/EvidenceForm';
import { blankControl, blankEvidence } from '../data/factories';
import {
  CONTROL_TEMPLATES,
  EVIDENCE_TYPES,
  controlFromTemplate,
  evidenceFromType,
} from '../data/templates';

type Tab = 'controls' | 'evidence';

export function ControlsEvidencePage() {
  const data = useStore((s) => s.data);
  const [tab, setTab] = useState<Tab>('controls');
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [templates, setTemplates] = useState<Tab | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const controlRows = useMemo(
    () =>
      data.controls.filter((c) => {
        if (q && !`${c.controlTitle} ${c.purpose} ${c.owner} ${c.controlCategory}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (status && c.status !== status) return false;
        return true;
      }),
    [data.controls, q, status]
  );
  const evidenceRows = useMemo(
    () =>
      data.evidence.filter((e) => {
        if (q && !`${e.evidenceTitle} ${e.description} ${e.owner} ${e.evidenceType}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (status && e.status !== status) return false;
        return true;
      }),
    [data.evidence, q, status]
  );

  const controlColumns: Column<Control>[] = [
    {
      header: 'Control',
      primary: true,
      cell: (c) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{c.controlTitle}</div>
          <div className="truncate text-[11px] text-faint">{c.controlCategory} · {c.affectedAISystemIds.length} system(s)</div>
        </div>
      ),
    },
    { header: 'Status', cell: (c) => <ControlStatusChip value={c.status} /> },
    {
      header: 'Evidence',
      cell: (c) =>
        controlLacksEvidence(c, data) ? (
          <Chip tone="danger"><Icon name="warning" size={11} /> Missing</Chip>
        ) : (
          <Chip tone="ok">{c.linkedEvidenceIds.length} linked</Chip>
        ),
    },
    { header: 'Owner', cell: (c) => <span className="text-xs text-muted">{c.owner || '—'}</span> },
    {
      header: 'Review',
      cell: (c) => {
        const st = reviewState(c.reviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  const evidenceColumns: Column<Evidence>[] = [
    {
      header: 'Evidence',
      primary: true,
      cell: (e) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{e.evidenceTitle}</div>
          <div className="truncate text-[11px] text-faint">{e.evidenceType} · {e.linkedAISystemIds.length} system(s)</div>
        </div>
      ),
    },
    { header: 'Status', cell: (e) => <EvidenceStatusChip value={e.status} /> },
    { header: 'Owner', cell: (e) => <span className="text-xs text-muted">{e.owner || '—'}</span> },
    { header: 'Reference', cell: (e) => <span className="truncate text-xs text-muted">{e.fileReferenceOrUrlOrNote || '—'}</span> },
    {
      header: 'Review',
      cell: (e) => {
        const st = reviewState(e.reviewDate);
        return st === 'none' ? <span className="text-faint">—</span> : <ReviewChip state={st} />;
      },
    },
  ];

  const statusOptions =
    tab === 'controls'
      ? ['not-started', 'planned', 'implemented', 'needs-review', 'missing-evidence', 'retired']
      : ['missing', 'draft', 'available', 'reviewed', 'expired'];

  return (
    <>
      <PageHeader
        title="Controls & Evidence"
        description="Controls reduce risks; evidence shows the controls are real. A control marked “evidence required” needs at least one available or reviewed evidence item."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTemplates(tab)}>
              <Icon name="copy" size={14} /> Templates
            </Button>
            <Button variant="primary" onClick={() => (tab === 'controls' ? setEditingControl(blankControl()) : setEditingEvidence(blankEvidence()))}>
              <Icon name="plus" /> New {tab === 'controls' ? 'control' : 'evidence'}
            </Button>
          </div>
        }
      />

      <div className="mb-4 inline-flex rounded-lg border border-border bg-panel p-0.5">
        {(['controls', 'evidence'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setStatus(''); }}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-brand/15 text-brand' : 'text-muted hover:text-ink'
            )}
          >
            {t} ({t === 'controls' ? data.controls.length : data.evidence.length})
          </button>
        ))}
      </div>

      {(tab === 'controls' ? data.controls.length : data.evidence.length) === 0 ? (
        <EmptyState
          icon={tab === 'controls' ? '▣' : '▤'}
          title={tab === 'controls' ? 'No controls yet' : 'No evidence yet'}
          hint={
            tab === 'controls'
              ? 'Add controls like human oversight, logging & audit trail, vendor assessment, or bias testing. Use Templates to start quickly.'
              : 'Add evidence like a risk assessment, model card, logging configuration, or DPIA note. Store a reference or note — not the sensitive file itself.'
          }
          action={
            <Button variant="primary" onClick={() => setTemplates(tab)}>Add from template</Button>
          }
        />
      ) : (
        <>
          <FilterBar
            search={q}
            onSearch={setQ}
            searchPlaceholder={`Search ${tab}…`}
            filters={[{ label: 'Status', value: status, onChange: setStatus, options: statusOptions.map((v) => ({ value: v, label: v })) }]}
          />
          {tab === 'controls' ? (
            <DataTable rows={controlRows} columns={controlColumns} getKey={(c) => c.id} onRowClick={(c) => setEditingControl(c)} />
          ) : (
            <DataTable rows={evidenceRows} columns={evidenceColumns} getKey={(e) => e.id} onRowClick={(e) => setEditingEvidence(e)} />
          )}
        </>
      )}

      {editingControl && <ControlForm initial={editingControl} onClose={() => setEditingControl(null)} />}
      {editingEvidence && <EvidenceForm initial={editingEvidence} onClose={() => setEditingEvidence(null)} />}

      {templates === 'controls' && (
        <Modal open onClose={() => setTemplates(null)} title="Control templates" subtitle="Pick a common control to start from." size="lg">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CONTROL_TEMPLATES.map((t) => (
              <button key={t.controlTitle} onClick={() => { setTemplates(null); setEditingControl(controlFromTemplate(t)); }} className="rounded-lg border border-border bg-panel-2 p-3 text-left hover:border-border-strong hover:bg-elevated">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{t.controlTitle}</span>
                  <Chip tone="neutral">{t.controlCategory}</Chip>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-faint">{t.purpose}</p>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {templates === 'evidence' && (
        <Modal open onClose={() => setTemplates(null)} title="Evidence templates" subtitle="Pick an evidence type to start from." size="lg">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EVIDENCE_TYPES.map((t) => (
              <button key={t} onClick={() => { setTemplates(null); setEditingEvidence(evidenceFromType(t)); }} className="rounded-lg border border-border bg-panel-2 px-3 py-2.5 text-left text-sm text-ink hover:border-border-strong hover:bg-elevated">
                {t}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
