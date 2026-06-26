import { useState } from 'react';
import type { AIRisk, Impact, Likelihood, RiskStatus, RequirementArea } from '../../types';
import { FRAMEWORKS, REQUIREMENT_AREAS, RISK_STATUS_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TagPicker, LinkPicker } from '../ui/Field';
import { SeverityChip } from '../ui/statusChips';
import { useStore } from '../../store/useStore';
import { computeSeverity } from '../../lib/severity';
import { RISK_CATEGORIES } from '../../data/templates';

export function RiskForm({ initial, onClose }: { initial: AIRisk; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertRisk = useStore((s) => s.upsertRisk);
  const [d, setD] = useState<AIRisk>(initial);
  const set = <K extends keyof AIRisk>(k: K, v: AIRisk[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !data.risks.some((r) => r.id === initial.id);

  const severity = computeSeverity(d.likelihood, d.impact);

  function toggle(field: 'linkedControlIds' | 'linkedEvidenceIds', id: string) {
    const arr = d[field];
    set(field, arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    upsertRisk({ ...d, riskTitle: d.riskTitle.trim() || 'Untitled risk', severity });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'New risk' : `Edit — ${initial.riskTitle}`}
      subtitle="Describe the AI risk, its likelihood/impact, and how it is being treated."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save risk</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Risk title" className="sm:col-span-2">
          <Input value={d.riskTitle} onChange={(e) => set('riskTitle', e.target.value)} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={d.riskDescription} onChange={(e) => set('riskDescription', e.target.value)} />
        </Field>
        <Field label="Affected AI system">
          <Select value={d.affectedAISystemId} onChange={(e) => set('affectedAISystemId', e.target.value)}>
            <option value="">— none —</option>
            {data.systems.map((s) => (
              <option key={s.id} value={s.id}>{s.systemName}</option>
            ))}
          </Select>
        </Field>
        <Field label="Risk category">
          <Select value={d.riskCategory} onChange={(e) => set('riskCategory', e.target.value)}>
            {RISK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Likelihood">
          <Select value={d.likelihood} onChange={(e) => set('likelihood', e.target.value as Likelihood)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </Field>
        <Field label="Impact">
          <Select value={d.impact} onChange={(e) => set('impact', e.target.value as Impact)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
        <div className="flex items-center gap-2 sm:col-span-2">
          <span className="text-xs text-muted">Derived severity:</span>
          <SeverityChip value={severity} />
          <span className="text-[11px] text-faint">(likelihood × impact)</span>
        </div>
        <Field label="Owner">
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={d.status} onChange={(e) => set('status', e.target.value as RiskStatus)}>
            {(Object.keys(RISK_STATUS_LABELS) as RiskStatus[]).map((s) => (
              <option key={s} value={s}>{RISK_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mitigation" className="sm:col-span-2">
          <Textarea value={d.mitigation} onChange={(e) => set('mitigation', e.target.value)} />
        </Field>
        <Field label="Residual risk" term="residual risk">
          <Input value={d.residualRisk} onChange={(e) => set('residualRisk', e.target.value)} />
        </Field>
        <Field label="Review date">
          <Input type="date" value={d.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
        </Field>
        <Field label="Requirement area">
          <Select value={d.requirementArea ?? ''} onChange={(e) => set('requirementArea', (e.target.value || undefined) as RequirementArea | undefined)}>
            <option value="">— none —</option>
            {REQUIREMENT_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Framework tags" className="sm:col-span-2">
          <TagPicker options={FRAMEWORKS} selected={d.frameworkTags} onToggle={(f) => set('frameworkTags', d.frameworkTags.includes(f) ? d.frameworkTags.filter((x) => x !== f) : [...d.frameworkTags, f])} />
        </Field>
        <Field label="Linked controls">
          <LinkPicker
            options={data.controls.map((c) => ({ id: c.id, label: c.controlTitle, sub: c.controlCategory }))}
            selected={d.linkedControlIds}
            onToggle={(id) => toggle('linkedControlIds', id)}
            emptyText="No controls yet."
          />
        </Field>
        <Field label="Linked evidence">
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
