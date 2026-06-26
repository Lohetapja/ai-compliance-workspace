import { useState } from 'react';
import type { AISystem, SystemStatus, RiskCategory, AutonomyLevel } from '../../types';
import { FRAMEWORKS, RISK_CATEGORY_LABELS, SYSTEM_STATUS_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TriSelect, Checkbox, TagPicker } from '../ui/Field';
import { useStore } from '../../store/useStore';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-1">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function SystemForm({
  initial,
  onClose,
}: {
  initial: AISystem;
  onClose: () => void;
}) {
  const upsertSystem = useStore((s) => s.upsertSystem);
  const [d, setD] = useState<AISystem>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof AISystem>(k: K, v: AISystem[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const isNew = !useStore
    .getState()
    .data.systems.some((s) => s.id === initial.id);

  function save() {
    const e: Record<string, string> = {};
    if (!d.systemName.trim()) e.systemName = 'System name is required.';
    if (!d.owner.trim()) e.owner = 'Owner is required.';
    if (!d.currentStatus) e.currentStatus = 'Status is required.';
    if (!d.riskCategory) e.riskCategory = 'Risk band is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertSystem({ ...d, systemName: d.systemName.trim() });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={isNew ? 'New AI system' : `Edit — ${initial.systemName}`}
      subtitle="Capture what the system is, who owns it, what data it uses, and how it is overseen."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Save system
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Identity">
          <Field label="System name" className="sm:col-span-2" required error={errors.systemName}>
            <Input value={d.systemName} onChange={(e) => set('systemName', e.target.value)} placeholder="e.g. Customer Support Assistant" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={d.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Business purpose" className="sm:col-span-2">
            <Textarea value={d.businessPurpose} onChange={(e) => set('businessPurpose', e.target.value)} />
          </Field>
          <Field label="Owner" required error={errors.owner}>
            <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
          </Field>
          <Field label="Business unit">
            <Input value={d.businessUnit} onChange={(e) => set('businessUnit', e.target.value)} />
          </Field>
        </Section>

        <Section title="Use & users">
          <Field label="User groups">
            <Input value={d.userGroups} onChange={(e) => set('userGroups', e.target.value)} placeholder="e.g. external customers, support agents" />
          </Field>
          <Field label="Internal / external use">
            <Select value={d.internalOrExternalUse} onChange={(e) => set('internalOrExternalUse', e.target.value as AISystem['internalOrExternalUse'])}>
              <option value="internal">Internal</option>
              <option value="external">External</option>
              <option value="both">Both</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <div className="flex items-end pb-1">
            <Checkbox checked={d.customerFacing} onChange={(v) => set('customerFacing', v)} label="Customer-facing" />
          </div>
          <Field label="Autonomy level" term="autonomy">
            <Select value={d.autonomyLevel} onChange={(e) => set('autonomyLevel', e.target.value as AutonomyLevel)}>
              <option value="advisory">Advisory</option>
              <option value="semi-autonomous">Semi-autonomous</option>
              <option value="autonomous">Autonomous</option>
            </Select>
          </Field>
        </Section>

        <Section title="Model & deployment">
          <Field label="Model type">
            <Input value={d.modelType} onChange={(e) => set('modelType', e.target.value)} placeholder="e.g. third-party LLM (RAG)" />
          </Field>
          <Field label="Vendor / provider">
            <Input value={d.vendorOrProvider} onChange={(e) => set('vendorOrProvider', e.target.value)} />
          </Field>
          <Field label="Open-source / commercial">
            <Select value={d.openSourceOrCommercial} onChange={(e) => set('openSourceOrCommercial', e.target.value as AISystem['openSourceOrCommercial'])}>
              <option value="open-source">Open-source</option>
              <option value="commercial">Commercial</option>
              <option value="in-house">In-house</option>
              <option value="mixed">Mixed</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Deployment environment">
            <Input value={d.deploymentEnvironment} onChange={(e) => set('deploymentEnvironment', e.target.value)} />
          </Field>
          <Field label="Deployment region">
            <Input value={d.deploymentRegion} onChange={(e) => set('deploymentRegion', e.target.value)} placeholder="e.g. EU (Finland)" />
          </Field>
        </Section>

        <Section title="Data">
          <Field label="Data used" className="sm:col-span-2">
            <Textarea value={d.dataUsed} onChange={(e) => set('dataUsed', e.target.value)} />
          </Field>
          <Field label="Data sources">
            <Input value={d.dataSources} onChange={(e) => set('dataSources', e.target.value)} />
          </Field>
          <Field label="Data provenance known" term="data provenance">
            <TriSelect value={d.dataProvenanceKnown} onChange={(v) => set('dataProvenanceKnown', v)} />
          </Field>
          <Field label="Personal data involved">
            <TriSelect value={d.personalDataInvolved} onChange={(v) => set('personalDataInvolved', v)} />
          </Field>
          <Field label="Sensitive data involved">
            <TriSelect value={d.sensitiveDataInvolved} onChange={(v) => set('sensitiveDataInvolved', v)} />
          </Field>
          <Field label="Training data used">
            <Input value={d.trainingDataUsed} onChange={(e) => set('trainingDataUsed', e.target.value)} />
          </Field>
          <Field label="Inference data used">
            <Input value={d.inferenceDataUsed} onChange={(e) => set('inferenceDataUsed', e.target.value)} />
          </Field>
        </Section>

        <Section title="Oversight & operations">
          <Field label="Human oversight owner" term="human oversight owner">
            <Input value={d.humanOversightOwner} onChange={(e) => set('humanOversightOwner', e.target.value)} />
          </Field>
          <Field label="Human review required">
            <TriSelect value={d.humanReviewRequired} onChange={(v) => set('humanReviewRequired', v)} />
          </Field>
          <Field label="Logging enabled">
            <TriSelect value={d.loggingEnabled} onChange={(v) => set('loggingEnabled', v)} />
          </Field>
          <Field label="Audit trail available" term="audit trail">
            <TriSelect value={d.auditTrailAvailable} onChange={(v) => set('auditTrailAvailable', v)} />
          </Field>
          <Field label="Monitoring enabled">
            <TriSelect value={d.monitoringEnabled} onChange={(v) => set('monitoringEnabled', v)} />
          </Field>
        </Section>

        <Section title="Status & review">
          <Field label="Current status" required error={errors.currentStatus}>
            <Select value={d.currentStatus} onChange={(e) => set('currentStatus', e.target.value as SystemStatus)}>
              {(Object.keys(SYSTEM_STATUS_LABELS) as SystemStatus[]).map((s) => (
                <option key={s} value={s}>
                  {SYSTEM_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Risk band (indicative, not legal)" required error={errors.riskCategory}>
            <Select value={d.riskCategory} onChange={(e) => set('riskCategory', e.target.value as RiskCategory)}>
              {(Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[]).map((c) => (
                <option key={c} value={c}>
                  {RISK_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Last review date">
            <Input type="date" value={d.lastReviewDate} onChange={(e) => set('lastReviewDate', e.target.value)} />
          </Field>
          <Field label="Next review date">
            <Input type="date" value={d.nextReviewDate} onChange={(e) => set('nextReviewDate', e.target.value)} />
          </Field>
        </Section>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
            Review flags
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Checkbox checked={d.legalReviewNeeded} onChange={(v) => set('legalReviewNeeded', v)} label="Legal review needed" />
            <Checkbox checked={d.privacyReviewNeeded} onChange={(v) => set('privacyReviewNeeded', v)} label="Privacy review needed" />
            <Checkbox checked={d.securityReviewNeeded} onChange={(v) => set('securityReviewNeeded', v)} label="Security review needed" />
            <Checkbox checked={d.vendorReviewNeeded} onChange={(v) => set('vendorReviewNeeded', v)} label="Vendor review needed" />
            <Checkbox checked={d.humanOversightReviewNeeded} onChange={(v) => set('humanOversightReviewNeeded', v)} label="Human-oversight review needed" />
          </div>
        </fieldset>

        <Field label="Framework tags (high-level)" term="framework mapping">
          <TagPicker options={FRAMEWORKS} selected={d.frameworkTags} onToggle={(f) => set('frameworkTags', d.frameworkTags.includes(f) ? d.frameworkTags.filter((x) => x !== f) : [...d.frameworkTags, f])} />
        </Field>

        <Field label="Notes">
          <Textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
