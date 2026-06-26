import { useState } from 'react';
import type { Evidence, EvidenceStatus } from '../../types';
import { EVIDENCE_STATUS_LABELS, FRAMEWORKS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TagPicker, LinkPicker } from '../ui/Field';
import { useStore } from '../../store/useStore';
import { EVIDENCE_TYPES } from '../../data/templates';

export function EvidenceForm({ initial, onClose }: { initial: Evidence; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertEvidence = useStore((s) => s.upsertEvidence);
  const removeEvidence = useStore((s) => s.removeEvidence);
  const [d, setD] = useState<Evidence>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Evidence>(k: K, v: Evidence[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !data.evidence.some((e) => e.id === initial.id);

  function toggle(field: 'linkedAISystemIds' | 'linkedControlIds' | 'linkedRiskIds', id: string) {
    const arr = d[field];
    set(field, arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!d.evidenceTitle.trim()) e.evidenceTitle = 'Evidence title is required.';
    if (!d.evidenceType) e.evidenceType = 'Type is required.';
    if (!d.owner.trim()) e.owner = 'Owner is required.';
    if (!d.status) e.status = 'Status is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertEvidence({ ...d, evidenceTitle: d.evidenceTitle.trim() });
    onClose();
  }

  function del() {
    if (confirm(`Delete evidence "${initial.evidenceTitle}" from local demo data? This cannot be undone.`)) {
      removeEvidence(initial.id);
      onClose();
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New evidence' : `Edit — ${initial.evidenceTitle}`}
      subtitle="Evidence is a record that shows a control is real. Store a reference or note — not the sensitive file itself."
      footer={
        <>
          {!isNew && <Button variant="danger" onClick={del} className="mr-auto">Delete</Button>}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save evidence</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Evidence title" className="sm:col-span-2" required error={errors.evidenceTitle}>
          <Input value={d.evidenceTitle} onChange={(e) => set('evidenceTitle', e.target.value)} />
        </Field>
        <Field label="Evidence type" required error={errors.evidenceType}>
          <Select value={d.evidenceType} onChange={(e) => set('evidenceType', e.target.value)}>
            {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Status" required error={errors.status}>
          <Select value={d.status} onChange={(e) => set('status', e.target.value as EvidenceStatus)}>
            {(Object.keys(EVIDENCE_STATUS_LABELS) as EvidenceStatus[]).map((s) => (
              <option key={s} value={s}>{EVIDENCE_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={d.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="Owner" required error={errors.owner}>
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <Field label="Review date">
          <Input type="date" value={d.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
        </Field>
        <Field label="Reference / URL / note" className="sm:col-span-2" hint="Avoid pasting confidential content — a pointer or short note is enough for the demo.">
          <Input value={d.fileReferenceOrUrlOrNote} onChange={(e) => set('fileReferenceOrUrlOrNote', e.target.value)} placeholder="e.g. wiki link, ticket id, or 'note only'" />
        </Field>
        <Field label="Framework tags" className="sm:col-span-2">
          <TagPicker options={FRAMEWORKS} selected={d.frameworkTags} onToggle={(f) => set('frameworkTags', d.frameworkTags.includes(f) ? d.frameworkTags.filter((x) => x !== f) : [...d.frameworkTags, f])} />
        </Field>
        <Field label="Linked AI systems">
          <LinkPicker
            options={data.systems.map((s) => ({ id: s.id, label: s.systemName, sub: s.owner }))}
            selected={d.linkedAISystemIds}
            onToggle={(id) => toggle('linkedAISystemIds', id)}
            emptyText="No systems yet."
          />
        </Field>
        <Field label="Linked controls">
          <LinkPicker
            options={data.controls.map((c) => ({ id: c.id, label: c.controlTitle, sub: c.controlCategory }))}
            selected={d.linkedControlIds}
            onToggle={(id) => toggle('linkedControlIds', id)}
            emptyText="No controls yet."
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
