import { useState } from 'react';
import type { AutonomyLevel, IntakeStatus, UseCaseIntake } from '../../types';
import { INTAKE_STATUS_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TriSelect, Checkbox } from '../ui/Field';
import { useStore } from '../../store/useStore';

export function UseCaseForm({ initial, onClose }: { initial: UseCaseIntake; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertUseCase = useStore((s) => s.upsertUseCase);
  const removeUseCase = useStore((s) => s.removeUseCase);
  const [d, setD] = useState<UseCaseIntake>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof UseCaseIntake>(k: K, v: UseCaseIntake[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !(data.useCases ?? []).some((u) => u.id === initial.id);

  function save() {
    const e: Record<string, string> = {};
    if (!d.requestTitle.trim()) e.requestTitle = 'Request title is required.';
    if (!d.requester.trim()) e.requester = 'Requester is required.';
    if (!d.businessPurpose.trim()) e.businessPurpose = 'Business purpose is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertUseCase({ ...d, requestTitle: d.requestTitle.trim() });
    onClose();
  }

  function del() {
    if (confirm(`Delete intake "${initial.requestTitle}" from local demo data? This cannot be undone.`)) {
      removeUseCase(initial.id);
      onClose();
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isNew ? 'New use case intake' : `Edit — ${initial.requestTitle}`}
      subtitle="A lightweight request to assess a proposed AI use case before it becomes a system."
      footer={
        <>
          {!isNew && <Button variant="danger" onClick={del} className="mr-auto">Delete</Button>}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save intake</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Request title" className="sm:col-span-2" required error={errors.requestTitle}>
          <Input value={d.requestTitle} onChange={(e) => set('requestTitle', e.target.value)} placeholder="e.g. AI assistant for X" />
        </Field>
        <Field label="Requester" required error={errors.requester}>
          <Input value={d.requester} onChange={(e) => set('requester', e.target.value)} />
        </Field>
        <Field label="Business unit">
          <Input value={d.businessUnit} onChange={(e) => set('businessUnit', e.target.value)} />
        </Field>
        <Field label="Business purpose" className="sm:col-span-2" required error={errors.businessPurpose}>
          <Textarea value={d.businessPurpose} onChange={(e) => set('businessPurpose', e.target.value)} />
        </Field>
        <Field label="Intended users">
          <Input value={d.intendedUsers} onChange={(e) => set('intendedUsers', e.target.value)} />
        </Field>
        <Field label="Use type">
          <Select value={d.useType} onChange={(e) => set('useType', e.target.value as UseCaseIntake['useType'])}>
            <option value="internal">Internal</option>
            <option value="external">External</option>
            <option value="both">Both</option>
            <option value="customer-facing">Customer-facing</option>
            <option value="unknown">Unknown</option>
          </Select>
        </Field>
        <Field label="Data involved" className="sm:col-span-2">
          <Input value={d.dataInvolved} onChange={(e) => set('dataInvolved', e.target.value)} />
        </Field>
        <Field label="Personal data">
          <TriSelect value={d.personalData} onChange={(v) => set('personalData', v)} />
        </Field>
        <Field label="Sensitive data">
          <TriSelect value={d.sensitiveData} onChange={(v) => set('sensitiveData', v)} />
        </Field>
        <Field label="Vendor / provider">
          <Input value={d.vendorOrProvider} onChange={(e) => set('vendorOrProvider', e.target.value)} />
        </Field>
        <Field label="Autonomy level" term="autonomy">
          <Select value={d.autonomyLevel} onChange={(e) => set('autonomyLevel', e.target.value as AutonomyLevel)}>
            <option value="advisory">Advisory</option>
            <option value="semi-autonomous">Semi-autonomous</option>
            <option value="autonomous">Autonomous</option>
          </Select>
        </Field>
        <Field label="Expected impact" className="sm:col-span-2">
          <Textarea value={d.expectedImpact} onChange={(e) => set('expectedImpact', e.target.value)} />
        </Field>
        <Field label="Possible high-risk context">
          <TriSelect value={d.possibleHighRiskContext} onChange={(v) => set('possibleHighRiskContext', v)} />
        </Field>
        <Field label="Target go-live date">
          <Input type="date" value={d.targetGoLiveDate} onChange={(e) => set('targetGoLiveDate', e.target.value)} />
        </Field>
        <div className="sm:col-span-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Checkbox checked={d.securityReviewNeeded} onChange={(v) => set('securityReviewNeeded', v)} label="Security review needed" />
          <Checkbox checked={d.privacyReviewNeeded} onChange={(v) => set('privacyReviewNeeded', v)} label="Privacy review needed" />
          <Checkbox checked={d.legalReviewNeeded} onChange={(v) => set('legalReviewNeeded', v)} label="Legal review needed" />
        </div>
        <Field label="Status" required>
          <Select value={d.status} onChange={(e) => set('status', e.target.value as IntakeStatus)}>
            {(Object.keys(INTAKE_STATUS_LABELS) as IntakeStatus[]).map((s) => (
              <option key={s} value={s}>{INTAKE_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
