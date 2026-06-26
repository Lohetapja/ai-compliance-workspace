import { useState } from 'react';
import type { Control, ControlCategory, ControlStatus, RequirementArea } from '../../types';
import {
  CONTROL_CATEGORIES,
  CONTROL_STATUS_LABELS,
  FRAMEWORKS,
  REQUIREMENT_AREAS,
} from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TagPicker, LinkPicker, Checkbox } from '../ui/Field';
import { useStore } from '../../store/useStore';

export function ControlForm({ initial, onClose }: { initial: Control; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertControl = useStore((s) => s.upsertControl);
  const removeControl = useStore((s) => s.removeControl);
  const [d, setD] = useState<Control>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Control>(k: K, v: Control[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !data.controls.some((c) => c.id === initial.id);

  function toggle(field: 'affectedAISystemIds' | 'linkedEvidenceIds' | 'linkedRiskIds', id: string) {
    const arr = d[field];
    set(field, arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!d.controlTitle.trim()) e.controlTitle = 'Control title is required.';
    if (!d.controlCategory) e.controlCategory = 'Category is required.';
    if (!d.owner.trim()) e.owner = 'Owner is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertControl({ ...d, controlTitle: d.controlTitle.trim() });
    onClose();
  }

  function del() {
    if (confirm(`Delete control "${initial.controlTitle}" from local demo data? This cannot be undone.`)) {
      removeControl(initial.id);
      onClose();
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New control' : `Edit — ${initial.controlTitle}`}
      subtitle="A control reduces a risk. Note what evidence proves it is real."
      footer={
        <>
          {!isNew && <Button variant="danger" onClick={del} className="mr-auto">Delete</Button>}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save control</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Control title" className="sm:col-span-2" required error={errors.controlTitle}>
          <Input value={d.controlTitle} onChange={(e) => set('controlTitle', e.target.value)} />
        </Field>
        <Field label="Category" required error={errors.controlCategory}>
          <Select value={d.controlCategory} onChange={(e) => set('controlCategory', e.target.value as ControlCategory)}>
            {CONTROL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={d.status} onChange={(e) => set('status', e.target.value as ControlStatus)}>
            {(Object.keys(CONTROL_STATUS_LABELS) as ControlStatus[]).map((s) => (
              <option key={s} value={s}>{CONTROL_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Purpose" className="sm:col-span-2">
          <Textarea value={d.purpose} onChange={(e) => set('purpose', e.target.value)} />
        </Field>
        <Field label="Owner" required error={errors.owner}>
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <Field label="Review date">
          <Input type="date" value={d.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
        </Field>
        <div className="flex items-end pb-1 sm:col-span-2">
          <Checkbox checked={d.evidenceRequired} onChange={(v) => set('evidenceRequired', v)} label="Evidence required for this control" term="evidence" />
        </div>
        <Field label="Requirement area">
          <Select value={d.requirementArea ?? ''} onChange={(e) => set('requirementArea', (e.target.value || undefined) as RequirementArea | undefined)}>
            <option value="">— none —</option>
            {REQUIREMENT_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Framework tags">
          <TagPicker options={FRAMEWORKS} selected={d.frameworkTags} onToggle={(f) => set('frameworkTags', d.frameworkTags.includes(f) ? d.frameworkTags.filter((x) => x !== f) : [...d.frameworkTags, f])} />
        </Field>
        <Field label="Applies to AI systems">
          <LinkPicker
            options={data.systems.map((s) => ({ id: s.id, label: s.systemName, sub: s.owner }))}
            selected={d.affectedAISystemIds}
            onToggle={(id) => toggle('affectedAISystemIds', id)}
            emptyText="No systems yet."
          />
        </Field>
        <Field label="Linked risks">
          <LinkPicker
            options={data.risks.map((r) => ({ id: r.id, label: r.riskTitle, sub: r.severity }))}
            selected={d.linkedRiskIds}
            onToggle={(id) => toggle('linkedRiskIds', id)}
            emptyText="No risks yet."
          />
        </Field>
        <Field label="Linked evidence" className="sm:col-span-2">
          <LinkPicker
            options={data.evidence.map((e) => ({ id: e.id, label: e.evidenceTitle, sub: e.status }))}
            selected={d.linkedEvidenceIds}
            onToggle={(id) => toggle('linkedEvidenceIds', id)}
            emptyText="No evidence yet."
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
