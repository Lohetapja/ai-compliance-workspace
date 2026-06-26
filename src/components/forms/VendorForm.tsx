import { useState } from 'react';
import type { ReviewStatus, RiskLevel, Vendor } from '../../types';
import { REVIEW_STATUS_LABELS } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea, TriSelect, LinkPicker } from '../ui/Field';
import { useStore } from '../../store/useStore';

const REVIEW_OPTS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const RISK_OPTS: RiskLevel[] = ['low', 'medium', 'high'];

export function VendorForm({ initial, onClose }: { initial: Vendor; onClose: () => void }) {
  const data = useStore((s) => s.data);
  const upsertVendor = useStore((s) => s.upsertVendor);
  const removeVendor = useStore((s) => s.removeVendor);
  const [d, setD] = useState<Vendor>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Vendor>(k: K, v: Vendor[K]) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !(data.vendors ?? []).some((v) => v.id === initial.id);

  function toggleSystem(id: string) {
    const arr = d.linkedAISystemIds;
    set('linkedAISystemIds', arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    const e: Record<string, string> = {};
    if (!d.vendorName.trim()) e.vendorName = 'Vendor name is required.';
    if (!d.owner.trim()) e.owner = 'Owner is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertVendor({ ...d, vendorName: d.vendorName.trim() });
    onClose();
  }

  function del() {
    if (confirm(`Delete vendor "${initial.vendorName}" from local demo data? This cannot be undone.`)) {
      removeVendor(initial.id);
      onClose();
    }
  }

  const reviewSelect = (label: string, key: keyof Vendor) => (
    <Field label={label}>
      <Select value={d[key] as ReviewStatus} onChange={(e) => set(key, e.target.value as Vendor[typeof key])}>
        {REVIEW_OPTS.map((s) => <option key={s} value={s}>{REVIEW_STATUS_LABELS[s]}</option>)}
      </Select>
    </Field>
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isNew ? 'New vendor' : `Edit — ${initial.vendorName}`}
      subtitle="Track third-party AI providers and the reviews they require. Use generic placeholder names only."
      footer={
        <>
          {!isNew && <Button variant="danger" onClick={del} className="mr-auto">Delete</Button>}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save vendor</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Vendor name" required error={errors.vendorName}>
          <Input value={d.vendorName} onChange={(e) => set('vendorName', e.target.value)} placeholder="e.g. Demo Foundation Model Provider" />
        </Field>
        <Field label="Service / model / provider type">
          <Input value={d.serviceType} onChange={(e) => set('serviceType', e.target.value)} />
        </Field>
        <Field label="Data shared" className="sm:col-span-2">
          <Input value={d.dataShared} onChange={(e) => set('dataShared', e.target.value)} />
        </Field>
        <Field label="Personal data shared">
          <TriSelect value={d.personalDataShared} onChange={(v) => set('personalDataShared', v)} />
        </Field>
        <Field label="Sensitive data shared">
          <TriSelect value={d.sensitiveDataShared} onChange={(v) => set('sensitiveDataShared', v)} />
        </Field>
        <Field label="Region">
          <Input value={d.region} onChange={(e) => set('region', e.target.value)} />
        </Field>
        <Field label="Owner" required error={errors.owner}>
          <Input value={d.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        {reviewSelect('Contract review status', 'contractReviewStatus')}
        {reviewSelect('Privacy review status', 'privacyReviewStatus')}
        {reviewSelect('Security review status', 'securityReviewStatus')}
        {reviewSelect('DPA status', 'dpaStatus')}
        <Field label="Subprocessors known">
          <TriSelect value={d.subprocessorsKnown} onChange={(v) => set('subprocessorsKnown', v)} />
        </Field>
        <Field label="Review date">
          <Input type="date" value={d.reviewDate} onChange={(e) => set('reviewDate', e.target.value)} />
        </Field>
        <Field label="Exit risk">
          <Select value={d.exitRisk} onChange={(e) => set('exitRisk', e.target.value as RiskLevel)}>
            {RISK_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Vendor dependency risk">
          <Select value={d.vendorDependencyRisk} onChange={(e) => set('vendorDependencyRisk', e.target.value as RiskLevel)}>
            {RISK_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Linked AI systems" className="sm:col-span-2">
          <LinkPicker
            options={data.systems.map((s) => ({ id: s.id, label: s.systemName, sub: s.owner }))}
            selected={d.linkedAISystemIds}
            onToggle={toggleSystem}
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
