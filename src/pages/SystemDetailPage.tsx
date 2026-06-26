import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type {
  AIRisk,
  AISystem,
  Control,
  Decision,
  Evidence,
  GapAction,
  Incident,
} from '../types';
import { RISK_CATEGORY_LABELS } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Card, CardHeader } from '../components/ui/Card';
import { Chip, type Tone } from '../components/ui/Chip';
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
import { blankControl, blankDecision, blankEvidence, blankGapAction, blankIncident, blankRisk } from '../data/factories';
import { SystemForm } from '../components/forms/SystemForm';
import { RiskForm } from '../components/forms/RiskForm';
import { ControlForm } from '../components/forms/ControlForm';
import { EvidenceForm } from '../components/forms/EvidenceForm';
import { GapActionForm } from '../components/forms/GapActionForm';
import { DecisionForm } from '../components/forms/DecisionForm';
import { IncidentForm } from '../components/forms/IncidentForm';

type Modal =
  | { t: 'system'; e: AISystem }
  | { t: 'risk'; e: AIRisk }
  | { t: 'control'; e: Control }
  | { t: 'evidence'; e: Evidence }
  | { t: 'gapAction'; e: GapAction }
  | { t: 'decision'; e: Decision }
  | { t: 'incident'; e: Incident }
  | null;

function Detail({ label, value, term }: { label: string; value: React.ReactNode; term?: string }) {
  return (
    <div>
      <dt className="flex items-center text-xs font-medium uppercase tracking-wide text-faint">
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
  anchorId,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
  empty: string;
  anchorId?: string;
}) {
  return (
    <Card id={anchorId} className="scroll-mt-20">
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

function TraceStep({ label, count, tone, targetId }: { label: string; count: number; tone: Tone; targetId?: string }) {
  const inner = (
    <>
      <span className="text-xs font-medium text-ink">{label}</span>
      <Chip tone={tone} className="mt-0.5">{count}</Chip>
    </>
  );
  const cls = 'inline-flex flex-col items-center rounded-lg border border-border bg-panel-2 px-2.5 py-1.5';
  if (targetId) {
    return (
      <button
        type="button"
        onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className={`${cls} hover:border-border-strong hover:bg-elevated`}
        title={`Jump to ${label}`}
      >
        {inner}
      </button>
    );
  }
  return <span className={cls}>{inner}</span>;
}

function TraceArrow() {
  return <span className="text-faint">→</span>;
}

export function SystemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useStore((s) => s.data);
  const removeSystem = useStore((s) => s.removeSystem);
  const duplicateSystem = useStore((s) => s.duplicateSystem);
  const archiveSystem = useStore((s) => s.archiveSystem);
  const patchGapAction = useStore((s) => s.patchGapAction);
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
  const gapActions = (data.gapActions ?? []).filter((g) => g.affectedAISystemId === system.id);
  const openGapActions = gapActions.filter((g) => g.status !== 'done' && g.status !== 'accepted-risk');
  const cov = systemCoverage(system, data);
  const gaps = systemGaps(system, data);

  function clone() {
    const newId = duplicateSystem(system!.id);
    if (newId) navigate(`/systems/${newId}`);
  }
  function del() {
    if (confirm(`Delete "${system!.systemName}" from local demo data? Linked items will be unlinked, not deleted. This cannot be undone.`)) {
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

      {/* Traceability chain */}
      <Card className="mb-4">
        <CardHeader title="Traceability" subtitle="How this system connects to its governance records" />
        <div className="flex flex-wrap items-center gap-1.5 p-4">
          <TraceStep label="AI System" count={1} tone="brand" />
          <TraceArrow />
          <TraceStep label="Risks" count={risks.length} tone="violet" targetId="panel-risks" />
          <TraceArrow />
          <TraceStep label="Controls" count={controls.length} tone="info" targetId="panel-controls" />
          <TraceArrow />
          <TraceStep label="Evidence" count={evidence.length} tone="ok" targetId="panel-evidence" />
          <TraceArrow />
          <TraceStep label="Decisions" count={decisions.length} tone="neutral" targetId="panel-decisions" />
          <TraceArrow />
          <TraceStep label="Incidents" count={incidents.length} tone={incidents.length ? 'warn' : 'neutral'} targetId="panel-incidents" />
          <TraceArrow />
          <TraceStep label="Gap Actions" count={openGapActions.length} tone={openGapActions.length ? 'danger' : 'neutral'} targetId="panel-gaps" />
          <TraceArrow />
          <button onClick={auditPack} className="rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 text-xs font-medium text-ink hover:border-border-strong hover:text-brand" title="Download audit pack">
            Reports →
          </button>
        </div>
      </Card>

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

          {(system.personalDataInvolved === 'yes' || system.sensitiveDataInvolved === 'yes' || system.dpiaNeeded || system.dataSubjects) && (
            <Card>
              <CardHeader title="Privacy / GDPR" subtitle="GDPR-relevant fields — for privacy review, not a legal determination" />
              <dl className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                <Detail label="Data subjects" value={system.dataSubjects} />
                <Detail label="Data categories" value={system.personalDataCategories} />
                <Detail label="Retention note" value={system.retentionPeriod} />
                <Detail label="Recipients / vendors" value={system.recipientsOrVendors} />
                <Detail label="Intl. transfer" value={system.internationalTransferFlag ? 'Yes' : 'No / unknown'} />
                <Detail label="Automated decision concern" value={system.automatedDecisionConcern ? 'Yes' : 'No'} />
                <Detail label="DPIA needed" value={system.dpiaNeeded ? 'Yes' : 'No'} />
                <Detail label="DPIA status" value={system.dpiaStatus} />
              </dl>
            </Card>
          )}

          {/* Linked panels */}
          <LinkedPanel anchorId="panel-risks" title="Linked risks" count={risks.length} onAdd={() => setModal({ t: 'risk', e: blankRisk(system.id) })} empty="No risks yet. Add prompt injection, data leakage, or bias risks.">
            {risks.map((r) => (
              <Row key={r.id} onClick={() => setModal({ t: 'risk', e: r })}>
                <span className="min-w-0 truncate text-sm text-ink">{r.riskTitle}</span>
                <span className="flex shrink-0 items-center gap-1.5"><SeverityChip value={r.severity} /><RiskStatusChip value={r.status} /></span>
              </Row>
            ))}
          </LinkedPanel>

          <LinkedPanel anchorId="panel-controls" title="Linked controls" count={controls.length} onAdd={() => setModal({ t: 'control', e: { ...blankControl(system.id) } })} empty="No controls yet. Add oversight, logging, or vendor controls.">
            {controls.map((c) => (
              <Row key={c.id} onClick={() => setModal({ t: 'control', e: c })}>
                <span className="min-w-0 truncate text-sm text-ink">{c.controlTitle}<span className="ml-2 text-xs text-faint">{c.controlCategory}</span></span>
                <ControlStatusChip value={c.status} />
              </Row>
            ))}
          </LinkedPanel>

          <LinkedPanel anchorId="panel-evidence" title="Linked evidence" count={evidence.length} onAdd={() => setModal({ t: 'evidence', e: blankEvidence(system.id) })} empty="No evidence yet. Attach a risk assessment, logging config, or model card.">
            {evidence.map((e) => (
              <Row key={e.id} onClick={() => setModal({ t: 'evidence', e })}>
                <span className="min-w-0 truncate text-sm text-ink">{e.evidenceTitle}<span className="ml-2 text-xs text-faint">{e.evidenceType}</span></span>
                <EvidenceStatusChip value={e.status} />
              </Row>
            ))}
          </LinkedPanel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkedPanel anchorId="panel-decisions" title="Linked decisions" count={decisions.length} onAdd={() => setModal({ t: 'decision', e: blankDecision(system.id) })} empty="No decisions recorded.">
              {decisions.map((d) => (
                <Row key={d.id} onClick={() => setModal({ t: 'decision', e: d })}>
                  <span className="min-w-0 truncate text-sm text-ink">{d.decisionTitle}</span>
                  <Chip tone="violet">{d.riskTreatment}</Chip>
                </Row>
              ))}
            </LinkedPanel>
            <LinkedPanel anchorId="panel-incidents" title="Linked incidents" count={incidents.length} onAdd={() => setModal({ t: 'incident', e: blankIncident(system.id) })} empty="No incidents logged.">
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
            <CardHeader
              title={`Open gaps (${gaps.length})`}
              subtitle="Missing-evidence & hygiene warnings"
              actions={<Button size="sm" variant="secondary" onClick={() => setModal({ t: 'gapAction', e: blankGapAction(system.id) })}>Create gap action</Button>}
            />
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

          <Card id="panel-gaps" className="scroll-mt-20">
            <CardHeader
              title={`Gap actions (${openGapActions.length})`}
              subtitle="Owned follow-ups for missing evidence, reviews, or controls"
              actions={<Button size="sm" variant="secondary" onClick={() => setModal({ t: 'gapAction', e: blankGapAction(system.id) })}>Add</Button>}
            />
            {gapActions.length === 0 ? (
              <p className="px-4 py-4 text-xs text-faint">No gap actions yet. Create one when a warning needs a named owner or due date.</p>
            ) : (
              <div className="divide-y divide-border">
                {gapActions.map((g) => (
                  <div key={g.id} className="px-4 py-3">
                    <button onClick={() => setModal({ t: 'gapAction', e: g })} className="w-full text-left">
                      <div className="text-sm font-medium text-ink">{g.title}</div>
                      <div className="mt-0.5 text-xs text-faint">{g.gapType} · {g.owner || 'No owner'} · {g.status}</div>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {g.status !== 'done' && (
                        <Button size="sm" variant="secondary" onClick={() => patchGapAction(g.id, { status: 'done' })}>Mark done</Button>
                      )}
                      {g.status !== 'accepted-risk' && (
                        <Button size="sm" variant="ghost" onClick={() => patchGapAction(g.id, { status: 'accepted-risk' })}>Accept risk</Button>
                      )}
                      {evidence.length > 0 && !g.linkedEvidenceId && (
                        <Button size="sm" variant="ghost" onClick={() => patchGapAction(g.id, { linkedEvidenceId: evidence[0].id })}>Link evidence</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
      {modal?.t === 'gapAction' && <GapActionForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'decision' && <DecisionForm initial={modal.e} onClose={() => setModal(null)} />}
      {modal?.t === 'incident' && <IncidentForm initial={modal.e} onClose={() => setModal(null)} />}
    </>
  );
}
