import { useState } from 'react';
import type { Decision, RiskTreatment } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, LinkPicker } from '../ui/Field';
import { useStore } from '../../store/useStore';

const TREATMENTS: RiskTreatment[] = ['accepted', 'mitigated', 'transferred', 'avoided', 'deferred'];

export function DecisionForm({ initial, onClose }: { initial: Decision; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertDecision = useStore((s) => s.upsertDecision);
  const [d, setD] = useState<Decision>(initial);
  const set = <K extends keyof Decision>(k: K, v: Decision[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !data.decisions.some((x) => x.id === initial.id);

  function toggle(field: 'linkedRiskIds' | 'linkedControlIds' | 'linkedEvidenceIds', id: string) {
    const arr = d[field];
    set(field, arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    upsertDecision({ ...d, decisionTitle: d.decisionTitle.trim() || 'Untitled decision' });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New decision' : `Edit — ${initial.decisionTitle}`}
      subtitle="Record what was decided, why, who reviewed it, what evidence was used, and when to revisit."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save decision</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Decision title" className="sm:col-span-2">
          <Input value={d.decisionTitle} onChange={(e) => set('decisionTitle', e.target.value)} />
        </Field>
        <Field label="Date">
          <Input type="date" value={d.date} onChange={(e) => set('date', e.target.value)} />
        </Field>
        <Field label="Decision owner">
          <Input value={d.decisionOwner} onChange={(e) => set('decisionOwner', e.target.value)} />
        </Field>
        <Field label="Affected AI system">
          <Select value={d.affectedAISystemId} onChange={(e) => set('affectedAISystemId', e.target.value)}>
            <option value="">— none —</option>
            {data.systems.map((s) => <option key={s.id} value={s.id}>{s.systemName}</option>)}
          </Select>
        </Field>
        <Field label="Risk treatment" term="risk treatment">
          <Select value={d.riskTreatment} onChange={(e) => set('riskTreatment', e.target.value as RiskTreatment)}>
            {TREATMENTS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </Select>
        </Field>
        <Field label="Decision summary" className="sm:col-span-2">
          <Textarea value={d.decisionSummary} onChange={(e) => set('decisionSummary', e.target.value)} />
        </Field>
        <Field label="Reason / rationale" className="sm:col-span-2">
          <Textarea value={d.reason} onChange={(e) => set('reason', e.target.value)} />
        </Field>
        <Field label="Evidence used (free text)">
          <Input value={d.evidenceUsed} onChange={(e) => set('evidenceUsed', e.target.value)} />
        </Field>
        <Field label="Reviewers">
          <Input value={d.reviewers} onChange={(e) => set('reviewers', e.target.value)} />
        </Field>
        <Field label="Next review date">
          <Input type="date" value={d.nextReviewDate} onChange={(e) => set('nextReviewDate', e.target.value)} />
        </Field>
        <div />
        <Field label="Linked risks">
          <LinkPicker
            options={data.risks.map((r) => ({ id: r.id, label: r.riskTitle, sub: r.severity }))}
            selected={d.linkedRiskIds}
            onToggle={(id) => toggle('linkedRiskIds', id)}
            emptyText="No risks yet."
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
        <Field label="Linked evidence" className="sm:col-span-2">
          <LinkPicker
            options={data.evidence.map((e) => ({ id: e.id, label: e.evidenceTitle, sub: e.evidenceType }))}
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
