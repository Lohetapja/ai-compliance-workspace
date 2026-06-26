import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type {
  AIRisk,
  AISystem,
  Control,
  Decision,
  Evidence,
  Incident,
} from '../types';
import { RISK_CATEGORY_LABELS } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Card, CardHeader } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { CoverageMeter } from '../components/ui/CoverageMeter';
import { InfoTip } from '../components/ui/Tooltip';
import {
  ControlStatusChip,
  EvidenceStatusChip,
  IncidentStatusChip,
  RiskCategoryChip,
  RiskStatusChip,
  SeverityChip,
  SystemStatusChip,
  ReviewChip,
} from '../components/ui/statusChips';
import { formatDate, reviewState } from '../lib/dates';
import { systemCoverage, systemGaps } from '../lib/coverage';
import { singleSystemAuditPack } from '../lib/reports';
import { downloadText, slugify } from '../lib/download';
import { blankControl, blankDecision, blankEvidence, blankIncident, blankRisk } from '../data/factories';
import { SystemForm } from '../components/forms/SystemForm';
import { RiskForm } from '../components/forms/RiskForm';
import { ControlForm } from '../components/forms/ControlForm';
import { EvidenceForm } from '../components/forms/EvidenceForm';
import { DecisionForm } from '../components/forms/DecisionForm';
import { IncidentForm } from '../components/forms/IncidentForm';

type Modal =
  | { t: 'system'; e: AISystem }
  | { t: 'risk'; e: AIRisk }
  | { t: 'control'; e: Control }
  | { t: 'evidence'; e: Evidence }
  | { t: 'decision'; e: Decision }
  | { t: 'incident'; e: Incident }
  | null;

function Detail({ label, value, term }: { label: string; value: React.ReactNode; term?: string }) {
  return (
    <div>
      <dt className="flex items-center text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
        {term && <InfoTip term={term} />}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value || <span className="text-faint">—</span>}</dd>
    </div>
  );
}

function LinkedPanel({
  title,
  count,
  onAdd,
  children,
  empty,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
  empty: string;
}) {
  return (
    <Card>
      <CardHeader
        title={`${title} (${count})`}
        actions={
          <Button size="sm" variant="secondary" onClick={onAdd}>
            <Icon name="plus" size={13} /> Add
          </Button>
        }
      />
      {count === 0 ? (
        <p className="px-4 py-5 text-xs text-faint">{empty}</p>
      ) : (
        <div className="divide-y divide-border">{children}</div>
      )}
    </Card>
  );
}

function Row({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-panel-2">
      {children}
    </button>
  );
}

export function SystemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useStore((s) => s.data);
  const removeSystem = useStore((s) => s.removeSystem);
  const duplicateSystem = useStore((s) => s.duplicateSystem);
  const archiveSystem = useStore((s) => s.archiveSystem);
  const [modal, setModal] = useState<Modal>(null);

  const system = data.systems.find((s) => s.id === id);
  if (!system) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted">This AI system was not found.</p>
        <Link to="/systems" className="mt-3 inline-block text-sm text-brand hover:underline">
          ← Back to AI Systems
        </Link>
      </div>
    );
  }

  const risks = data.risks.filter((r) => r.affectedAISystemId === system.id);
  const controls = data.controls.filter((c) => c.affectedAISystemIds.includes(system.id));
  const evidence = data.evidence.filter((e) => e.linkedAISystemIds.includes(system.id));
  const decisions = data.decisions.filter((d) => d.affectedAISystemId === system.id);
  const incidents = data.incidents.filter((i) => i.affectedAISystemId === system.id);
  const cov = systemCoverage(system, data);
  const gaps = systemGaps(system, data);

  function clone() {
    const newId = duplicateSystem(system!.id);
    if (newId) navigate(`/systems/${newId}`);
  }
  function del() {
    if (confirm(`Delete "${system!.systemName}"? Linked items will be unlinked, not deleted.`)) {
      removeSystem(system!.id);
      navigate('/systems');
    }
  }
  function auditPack() {
    const md = singleSystemAuditPack(data, system!);
    downloadText(`audit-pack-${slugify(system!.systemName)}.md`, md);
  }

  const flags = [
    system.legalReviewNeeded && 'Legal Review',
    system.privacyReviewNeeded && 'Privacy Review',
    system.securityReviewNeeded && 'Security Review',
    system.vendorReviewNeeded && 'Vendor Review',
    system.humanOversightReviewNeeded && 'Human Oversight Review',
  ].filter(Boolean) as string[];

  return (
    <>
      <Link to="/systems" className="mb-3 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
        ← AI Systems
      </Link>
      <PageHeader
        title={system.systemName}
        description={system.businessPurpose || system.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/risk-helper', { state: { systemId: system.id } })}>
              <Icon name="helper" size={14} /> Risk helper
            </Button>
            <Button variant="secondary" onClick={auditPack}>
              <Icon name="download" size={14} /> Audit pack
            </Button>
            <Button variant="secondary" onClick={() => setModal({ t: 'system', e: system })}>
              <Icon name="edit" size={14} /> Edit
            </Button>
            <Button variant="ghost" onClick={clone}><Icon name="copy" size={14} /> Clone</Button>
            {system.currentStatus !== 'archived' && (
              <Button variant="ghost" onClick={() => archiveSystem(system.id)}><Icon name="archive" size={14} /> Archive</Button>
            )}
            <Button variant="danger" onClick={del}><Icon name="trash" size={14} /> Delete</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SystemStatusChip value={system.currentStatus} />
        <RiskCategoryChip value={system.riskCategory} />
        {system.customerFacing && <Chip tone="info">Customer-facing</Chip>}
        {system.personalDataInvolved === 'yes' && <Chip tone="warn">Personal data</Chip>}
        {system.sensitiveDataInvolved === 'yes' && <Chip tone="danger">Sensitive data</Chip>}
        {reviewState(system.nextReviewDate) !== 'none' && <ReviewChip state={reviewState(system.nextReviewDate)} />}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Overview" />
            <dl className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
              <Detail label="Owner" value={system.owner} />
              <Detail label="Business unit" value={system.businessUnit} />
              <Detail label="Users" value={system.userGroups} />
              <Detail label="Use" value={system.internalOrExternalUse} />
              <Detail label="Autonomy" value={system.autonomyLevel} term="autonomy" />
              <Detail label="Human review" value={system.humanReviewRequired} />
              <Detail label="Model type" value={system.modelType} />
              <Detail label="Vendor / provider" value={system.vendorOrProvider} />
              <Detail label="Source" value={system.openSourceOrCommercial} />
              <Detail label="Deployment" value={system.deploymentEnvironment} />
              <Detail label="Region" value={system.deploymentRegion} />
              <Detail label="Oversight owner" value={system.humanOversightOwner} term="human oversight owner" />
              <Detail label="Logging" value={system.loggingEnabled} />
              <Detail label="Audit trail" value={system.auditTrailAvailable} term="audit trail" />
              <Detail label="Monitoring" value={system.monitoringEnabled} />
              <Detail label="Personal data" value={system.personalDataInvolved} />
              <Detail label="Sensitive data" value={system.sensitiveDataInvolved} />
              <Detail label="Provenance known" value={system.dataProvenanceKnown} term="data provenance" />
              <Detail label="Last review" value={formatDate(system.lastReviewDate)} />
              <Detail label="Next review" value={formatDate(system.nextReviewDate)} />
              <Detail label="Risk band" value={RISK_CATEGORY_LABELS[system.riskCategory]} />
            </dl>
            {(system.dataUsed || system.dataSources) && (
              <div className="border-t border-border px-4 py-3">
                <Detail label="Data used" value={system.dataUsed} />
                {system.dataSources && <div className="mt-2"><Detail label="Data sources" value={system.dataSources} /></div>}
              </div>
            )}
            {system.notes && (
              <div className="border-t border-border px-4 py-3">
                <Detail label="Notes" value={system.notes} />
              </div>
            )}
          </Card>

          {/* Linked panels */}
          <LinkedPanel title="Linked risks" count={risks.length} onAdd={() => setModal({ t: 'risk', e: blankRisk(system.id) })} empty="No risks yet. Add prompt injection, data leakage, or bias risks.">
            {risks.map((r) => (
              <Row key={r.id} onClick={() => setModal({ t: 'risk', e: r })}>
                <span className="min-w-0 truncate text-sm text-ink">{r.riskTitle}</span>
                <span className="flex shrink-0 items-center gap-1.5"><SeverityChip value={r.severity} /><RiskStatusChip value={r.status} /></span>
              </Row>
            ))}
          </LinkedPanel>

          <LinkedPanel title="Linked controls" count={controls.length} onAdd={() => setModal({ t: 'control', e: { ...blankControl(system.id) } })} empty="No controls yet. Add oversight, logging, or vendor controls.">
            {controls.map((c) => (
              <Row key={c.id} onClick={() => setModal({ t: 'control', e: c })}>
                <span className="min-w-0 truncate text-sm text-ink">{c.controlTitle}<span className="ml-2 text-[11px] text-faint">{c.controlCategory}</span></span>
                <ControlStatusChip value={c.status} />
              </Row>
            ))}
          </LinkedPanel>

          <LinkedPanel title="Linked evidence" count={evidence.length} onAdd={() => setModal({ t: 'evidence', e: blankEvidence(system.id) })} empty="No evidence yet. Attach a risk assessment, logging config, or model card.">
            {evidence.map((e) => (
              <Row key={e.id} onClick={() => setModal({ t: 'evidence', e })}>
                <span className="min-w-0 truncate text-sm text-ink">{e.evidenceTitle}<span className="ml-2 text-[11px] text-faint">{e.evidenceType}</span></span>
                <EvidenceStatusChip value={e.status} />
              </Row>
            ))}
          </LinkedPanel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkedPanel title="Linked decisions" count={decisions.length} onAdd={() => setModal({ t: 'decision', e: blankDecision(system.id) })} empty="No decisions recorded.">
              {decisions.map((d) => (
                <Row key={d.id} onClick={() => setModal({ t: 'decision', e: d })}>
                  <span className="min-w-0 truncate text-sm text-ink">{d.decisionTitle}</span>
                  <Chip tone="violet">{d.riskTreatment}</Chip>
                </Row>
              ))}
            </LinkedPanel>
            <LinkedPanel title="Linked incidents" count={incidents.length} onAdd={() => setModal({ t: 'incident', e: blankIncident(system.id) })} empty="No incidents logged.">
              {incidents.map((i) => (
                <Row key={i.id} onClick={() => setModal({ t: 'incident', e: i })}>
                  <span className="min-w-0 truncate text-sm text-ink">{i.incidentTitle}</span>
                  <IncidentStatusChip value={i.status} />
                </Row>
              ))}
            </LinkedPanel>
          </div>
        </div>

        {/* Right: flags, coverage, gaps */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Evidence coverage" />
            <div className="p-4">
              <CoverageMeter pct={cov.pct} documented={cov.documented} expected={cov.expected} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Review flags" subtitle="Recommended human reviews — not legal conclusions" />
            <div className="flex flex-wrap gap-1.5 p-4">
              {flags.length === 0 ? (
                <span className="text-xs text-faint">No review flags set.</span>
              ) : (
                flags.map((f) => <Chip key={f} tone="warn">{f} Recommended</Chip>)
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={`Open gaps (${gaps.length})`} subtitle="Missing-evidence & hygiene warnings" />
            {gaps.length === 0 ? (
              <p className="px-4 py-4 text-xs text-faint">No gaps detected from the recommended checklist.</p>
            ) : (
              <ul className="space-y-1.5 p-4">
                {gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Icon name={g.severity === 'warn' ? 'warning' : 'check'} size={13} className={g.severity === 'warn' ? 'mt-0.5 text-warn' : 'mt-0.5 text-faint'} />
                    <span className={g.severity === 'warn' ? 'text-ink' : 'text-muted'}>{g.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {system.classification && (
            <Card>
              <CardHeader title="Risk helper result" subtitle={`Suggested: ${RISK_CATEGORY_LABELS[system.classification.suggestedCategory]}`} />
              <div className="p-4">
                <p className="text-xs leading-relaxed text-muted">{system.classification.summary}</p>
                <Link to="/risk-helper" state={{ systemId: system.id }} className="mt-2 inline-block text-xs text-brand hover:underline">
                  Re-run risk helper →
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {modal?.t === 'system' && <SystemForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'risk' && <RiskForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'control' && <ControlForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'evidence' && <EvidenceForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'decision' && <DecisionForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'incident' && <IncidentForm initial={modal.e} onClose={() => setModal(null)} />}
    </>
  );
}
