import { useState } from 'react';
import type { GapAction, GapActionStatus, GapType, Severity } from '../../types';
import { GAP_ACTION_STATUS_LABELS, GAP_TYPES } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, LinkPicker, Select, Textarea } from '../ui/Field';
import { useStore } from '../../store/useStore';

export function GapActionForm({
  initial,
  onClose,
}: {
  initial: GapAction;
  onClose: () => void;
}) {
  const data = useStore((s) => s.data);
  const upsertGapAction = useStore((s) => s.upsertGapAction);
  const [d, setD] = useState<GapAction>(initial);
  const set = <K extends keyof GapAction>(k: K, v: GapAction[K]) =>
    setD((p) => ({ ...p, [k]: v }));
  const isNew = !(data.gapActions ?? []).some((g) => g.id === initial.id);

  function save() {
    const fallback = `${d.gapType} action`;
    upsertGapAction({ ...d, title: d.title.trim() || fallback });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New gap action' : `Edit - ${initial.title}`}
      subtitle="Turn a missing review item into a tracked action. This is workflow guidance, not a compliance determination."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save gap action</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          <Input value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Add logging evidence for support assistant" />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={d.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="Gap type">
          <Select value={d.gapType} onChange={(e) => set('gapType', e.target.value as GapType)}>
            {GAP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Severity">
          <Select value={d.severity} onChange={(e) => set('severity', e.target.value as Severity)}>
            {(['low', 'medium', 'high', 'critical'] as Severity[]).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Owner">
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <Field label="Due date">
          <Input type="date" value={d.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={d.status} onChange={(e) => set('status', e.target.value as GapActionStatus)}>
            {(Object.keys(GAP_ACTION_STATUS_LABELS) as GapActionStatus[]).map((s) => (
              <option key={s} value={s}>{GAP_ACTION_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Linked AI system">
          <Select value={d.affectedAISystemId} onChange={(e) => set('affectedAISystemId', e.target.value)}>
            <option value="">None selected</option>
            {data.systems.map((s) => <option key={s.id} value={s.id}>{s.systemName}</option>)}
          </Select>
        </Field>
        <Field label="Linked control">
          <Select value={d.linkedControlId} onChange={(e) => set('linkedControlId', e.target.value)}>
            <option value="">None selected</option>
            {data.controls.map((c) => <option key={c.id} value={c.id}>{c.controlTitle}</option>)}
          </Select>
        </Field>
        <Field label="Linked evidence">
          <Select value={d.linkedEvidenceId} onChange={(e) => set('linkedEvidenceId', e.target.value)}>
            <option value="">None selected</option>
            {data.evidence.map((e) => <option key={e.id} value={e.id}>{e.evidenceTitle}</option>)}
          </Select>
        </Field>
        <Field label="Linked risk">
          <Select value={d.linkedRiskId} onChange={(e) => set('linkedRiskId', e.target.value)}>
            <option value="">None selected</option>
            {data.risks.map((r) => <option key={r.id} value={r.id}>{r.riskTitle}</option>)}
          </Select>
        </Field>
        <Field label="Quick system link helper">
          <LinkPicker
            options={data.systems.map((s) => ({ id: s.id, label: s.systemName, sub: s.owner }))}
            selected={d.affectedAISystemId ? [d.affectedAISystemId] : []}
            onToggle={(id) => set('affectedAISystemId', d.affectedAISystemId === id ? '' : id)}
            emptyText="No systems yet."
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
