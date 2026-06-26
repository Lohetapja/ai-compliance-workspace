import { useState } from 'react';
import type { Incident, IncidentStatus, Severity } from '../../types';
import { INCIDENT_STATUS_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, LinkPicker } from '../ui/Field';
import { useStore } from '../../store/useStore';
import { INCIDENT_TYPES } from '../../data/templates';

const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

export function IncidentForm({ initial, onClose }: { initial: Incident; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertIncident = useStore((s) => s.upsertIncident);
  const [d, setD] = useState<Incident>(initial);
  const set = <K extends keyof Incident>(k: K, v: Incident[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !data.incidents.some((x) => x.id === initial.id);

  function toggle(id: string) {
    const arr = d.relatedRiskIds;
    set('relatedRiskIds', arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    upsertIncident({ ...d, incidentTitle: d.incidentTitle.trim() || 'Untitled incident' });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New incident / issue' : `Edit — ${initial.incidentTitle}`}
      subtitle="Capture what happened, impact, containment, root cause and lessons learned."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save incident</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Incident title" className="sm:col-span-2">
          <Input value={d.incidentTitle} onChange={(e) => set('incidentTitle', e.target.value)} />
        </Field>
        <Field label="Type">
          <Select value={d.type} onChange={(e) => set('type', e.target.value)}>
            {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Severity">
          <Select value={d.severity} onChange={(e) => set('severity', e.target.value as Severity)}>
            {SEVERITIES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </Select>
        </Field>
        <Field label="Affected AI system">
          <Select value={d.affectedAISystemId} onChange={(e) => set('affectedAISystemId', e.target.value)}>
            <option value="">— none —</option>
            {data.systems.map((s) => <option key={s.id} value={s.id}>{s.systemName}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={d.status} onChange={(e) => set('status', e.target.value as IncidentStatus)}>
            {(Object.keys(INCIDENT_STATUS_LABELS) as IncidentStatus[]).map((s) => (
              <option key={s} value={s}>{INCIDENT_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Detection time">
          <Input type="date" value={d.detectionTime} onChange={(e) => set('detectionTime', e.target.value)} />
        </Field>
        <Field label="Owner">
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={d.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="Impact" className="sm:col-span-2">
          <Textarea value={d.impact} onChange={(e) => set('impact', e.target.value)} />
        </Field>
        <Field label="Containment">
          <Textarea value={d.containment} onChange={(e) => set('containment', e.target.value)} />
        </Field>
        <Field label="Root cause">
          <Textarea value={d.rootCause} onChange={(e) => set('rootCause', e.target.value)} />
        </Field>
        <Field label="Evidence (free text)">
          <Input value={d.evidence} onChange={(e) => set('evidence', e.target.value)} />
        </Field>
        <Field label="Review date">
          <Input type="date" value={d.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
        </Field>
        <Field label="Follow-up actions" className="sm:col-span-2">
          <Textarea value={d.followUpActions} onChange={(e) => set('followUpActions', e.target.value)} />
        </Field>
        <Field label="Lessons learned" className="sm:col-span-2">
          <Textarea value={d.lessonsLearned} onChange={(e) => set('lessonsLearned', e.target.value)} />
        </Field>
        <Field label="Related risks" className="sm:col-span-2">
          <LinkPicker
            options={data.risks.map((r) => ({ id: r.id, label: r.riskTitle, sub: r.severity }))}
            selected={d.relatedRiskIds}
            onToggle={toggle}
            emptyText="No risks yet."
          />
        </Field>
      </div>
    </Modal>
  );
}
