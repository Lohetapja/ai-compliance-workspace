import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { dashboardStats, reviewItems, systemsNeedingAttention } from '../lib/selectors';
import { lensCounts, vendorReviewsPending, pendingIntakes } from '../lib/lenses';
import { RISK_CATEGORY_LABELS, type RiskCategory } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { CoverageMeter } from '../components/ui/CoverageMeter';
import { Chip } from '../components/ui/Chip';
import { ReviewChip } from '../components/ui/statusChips';
import { formatDate, relativeReview } from '../lib/dates';
import { cn } from '../components/ui/cn';
import { DashboardCustomizer } from '../components/DashboardCustomizer';
import { useGuidedDemo } from '../store/useGuidedDemo';
import { pickShowcaseSystem } from '../lib/demo';
import {
  reconcileOrder,
  useDashboardPrefs,
  type DashboardSectionId,
} from '../store/useDashboardPrefs';

const RISK_TONE: Record<RiskCategory, string> = {
  unassessed: 'bg-faint',
  minimal: 'bg-ok',
  limited: 'bg-info',
  elevated: 'bg-warn',
  'high-review-needed': 'bg-danger',
};

// Sections that should span the full grid width; the rest pack into columns.
const FULL_SECTIONS = new Set<DashboardSectionId>(['welcome', 'stats', 'framework-lenses', 'systems-needing-attention']);

export function DashboardPage() {
  const data = useStore((s) => s.data);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const prefs = useDashboardPrefs();
  const startDemo = useGuidedDemo((s) => s.start);
  const demoActive = useGuidedDemo((s) => s.active);
  const [customizing, setCustomizing] = useState(false);
  const demoSystem = pickShowcaseSystem(data);

  const stats = dashboardStats(data);
  const lens = lensCounts(data);
  const reviews = reviewItems(data);
  const attention = reviews.filter((r) => r.state === 'overdue' || r.state === 'due-7').slice(0, 8);
  const attentionSystems = systemsNeedingAttention(data);
  const vendorsPending = vendorReviewsPending(data);
  const intakesPending = pendingIntakes(data);
  const active = data.systems.filter((s) => s.currentStatus !== 'archived');
  const missingOversight = active.filter((s) => !s.humanOversightOwner && s.autonomyLevel !== 'advisory').length;
  const missingLogging = active.filter((s) => s.loggingEnabled !== 'yes').length;
  const missingAuditTrail = active.filter((s) => s.auditTrailAvailable !== 'yes').length;

  const dense = prefs.density === 'compact';
  const gap = dense ? 'gap-3' : 'gap-4';
  const statGap = dense ? 'gap-2' : 'gap-3';

  if (stats.totalSystems === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description={`AI governance overview for ${data.organizationName}.`} />
        <EmptyState
          icon="◳"
          title="No AI systems yet"
          hint="Start by adding an AI system — an internal chatbot, a model deployment API, an AI training pipeline, or a document summarizer. Or load the fictional sample company to explore the workspace."
          action={
            <div className="flex gap-2">
              <Button variant="primary" onClick={loadSampleData}>Load sample data</Button>
              <Link to="/systems"><Button variant="secondary">Go to AI Systems</Button></Link>
            </div>
          }
        />
      </>
    );
  }

  const reviewFlags = [
    { label: 'Legal review', n: stats.legalReview },
    { label: 'Privacy review', n: stats.privacyReview },
    { label: 'Security review', n: stats.securityReview },
    { label: 'Vendor review', n: stats.vendorReview },
    { label: 'Human-oversight review', n: stats.humanOversightReview },
  ];

  const sections: Record<DashboardSectionId, () => ReactNode> = {
    welcome: () => (
      <Card>
        <CardHeader
          title="Welcome to AI Compliance Workspace"
          subtitle="A practical browser-based workspace for organizing AI systems, risks, controls, evidence, decisions, incidents, and audit-readiness information."
        />
        <div className={cn('text-sm leading-relaxed text-muted', dense ? 'space-y-2 p-3' : 'space-y-3 p-4')}>
          <p>
            Recommended workflow: create an AI system → classify possible risk → add risks → assign controls →
            attach evidence → record decisions → log incidents/issues → export an audit pack → review again later.
          </p>
          <p className="text-xs text-faint">
            This is a local-first demo. Data stays in browser localStorage. Do not enter real confidential,
            customer, regulated, or sensitive data.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={loadSampleData}>Start with sample data</Button>
            <Link to="/systems"><Button variant="secondary">Create first AI system</Button></Link>
            <Link to="/about"><Button variant="ghost">Read disclaimer</Button></Link>
          </div>
        </div>
      </Card>
    ),

    stats: () => (
      <div className={dense ? 'space-y-2' : 'space-y-3'}>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4', statGap)}>
          <StatCard label="AI systems" value={stats.totalSystems} icon="systems" tone="brand" to="/systems" />
          <StatCard label="Possible high-risk" value={stats.possibleHighRisk} icon="warning" tone="danger" to="/systems" hint="Review needed — not a legal determination" emphasize={stats.possibleHighRisk > 0} />
          <StatCard label="Open critical risks" value={stats.openCriticalRisks} icon="risk" tone="critical" to="/risks" emphasize={stats.openCriticalRisks > 0} />
          <StatCard label="Open incidents" value={stats.openIncidents} icon="incident" tone="warn" to="/incidents" emphasize={stats.openIncidents > 0} />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4', statGap)}>
          <StatCard label="Overdue reviews" value={stats.overdueReviews} tone={stats.overdueReviews ? 'danger' : 'ok'} icon="warning" to="/review-queue" />
          <StatCard label="Reviews due ≤ 7 days" value={stats.due7} tone={stats.due7 ? 'warn' : 'neutral'} to="/review-queue" />
          <StatCard label="Reviews due ≤ 30 days" value={stats.due30} tone="info" to="/review-queue" />
          <StatCard label="Open high risks" value={stats.openHighRisks} tone={stats.openHighRisks ? 'warn' : 'neutral'} to="/risks" />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4', statGap)}>
          <StatCard label="Controls without evidence" value={stats.controlsWithoutEvidence} tone={stats.controlsWithoutEvidence ? 'danger' : 'ok'} icon="controls" to="/controls" />
          <StatCard label="Missing evidence items" value={stats.missingEvidenceCount} tone={stats.missingEvidenceCount ? 'warn' : 'ok'} to="/controls" hint="From recommended checklist" />
          <StatCard label="Open gap actions" value={stats.openGapActions} tone={stats.openGapActions ? 'warn' : 'ok'} icon="warning" to="/gap-actions" />
          <StatCard label="Overdue gap actions" value={stats.overdueGapActions} tone={stats.overdueGapActions ? 'danger' : 'ok'} to="/gap-actions" />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4', statGap)}>
          <StatCard label="High-severity gaps" value={stats.highSeverityGapActions} tone={stats.highSeverityGapActions ? 'danger' : 'ok'} to="/gap-actions" />
          <StatCard label="Systems for legal review" value={stats.legalReview} tone={stats.legalReview ? 'warn' : 'neutral'} to="/systems" />
          <StatCard label="Systems for privacy review" value={stats.privacyReview} tone={stats.privacyReview ? 'warn' : 'neutral'} to="/systems" />
          <StatCard label="Systems for security review" value={stats.securityReview} tone={stats.securityReview ? 'warn' : 'neutral'} to="/systems" />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4', statGap)}>
          <StatCard label="Active systems" value={stats.activeSystems} tone="ok" icon="check" to="/systems" />
          <StatCard label="Customer-facing" value={stats.customerFacing} tone="info" to="/systems" />
          <StatCard label="With personal data" value={stats.withPersonalData} tone="warn" to="/systems" />
          <StatCard label="With sensitive data" value={stats.withSensitiveData} tone={stats.withSensitiveData ? 'danger' : 'neutral'} to="/systems" />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-5', statGap)}>
          <StatCard label="Vendor reviews pending" value={lens.vendorReviewsPending} tone={lens.vendorReviewsPending ? 'warn' : 'ok'} icon="box" to="/vendors" />
          <StatCard label="Intake requests pending" value={lens.intakePending} tone={lens.intakePending ? 'info' : 'neutral'} icon="inbox" to="/use-cases" />
          <StatCard label="Expired evidence" value={lens.expiredEvidence} tone={lens.expiredEvidence ? 'danger' : 'ok'} to="/controls" />
          <StatCard label="Evidence due soon" value={lens.evidenceDueSoon} tone={lens.evidenceDueSoon ? 'warn' : 'ok'} to="/controls" />
          <StatCard label="Evidence missing review date" value={lens.evidenceMissingReviewDate} tone={lens.evidenceMissingReviewDate ? 'warn' : 'ok'} to="/controls" />
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-3', statGap)}>
          <StatCard label="Systems missing human oversight" value={missingOversight} tone={missingOversight ? 'warn' : 'ok'} to="/systems" />
          <StatCard label="Systems missing logging" value={missingLogging} tone={missingLogging ? 'warn' : 'ok'} to="/systems" />
          <StatCard label="Systems missing audit trail" value={missingAuditTrail} tone={missingAuditTrail ? 'warn' : 'ok'} to="/systems" />
        </div>
      </div>
    ),

    'framework-lenses': () => (
      <Card>
        <CardHeader title="Framework lenses" subtitle="View the same data through governance angles — indicative only, not compliance determinations" actions={<Link to="/framework-lenses" className="text-xs text-brand hover:underline">Open →</Link>} />
        <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5', dense ? 'gap-2 p-3' : 'gap-2 p-4')}>
          {[
            { label: 'AI Act View', hint: `${lens.aiActReviewAreas} review area(s)`, icon: 'layers' as const },
            { label: 'GDPR View', hint: `${lens.gdprSystems} system(s)`, icon: 'shield' as const },
            { label: 'ISO 42001 View', hint: 'management areas', icon: 'framework' as const },
            { label: 'NIS2 View', hint: 'security evidence', icon: 'controls' as const },
            { label: 'AI Security View', hint: `${lens.securityRisks} open risk(s)`, icon: 'risk' as const },
          ].map((v) => (
            <Link key={v.label} to="/framework-lenses" className="rounded-lg border border-border bg-panel-2 p-3 hover:border-border-strong hover:bg-elevated">
              <div className="flex items-center gap-1.5 text-sm font-medium text-ink"><Icon name={v.icon} size={14} className="text-brand" /> {v.label}</div>
              <div className="mt-1 text-xs text-faint">{v.hint}</div>
            </Link>
          ))}
        </div>
      </Card>
    ),

    'what-to-do-next': () => (
      <Card className="h-full">
        <CardHeader title="What to do next" subtitle="Practical next steps" />
        <div className={cn('flex flex-col gap-2', dense ? 'p-3' : 'p-4')}>
          {[
            { to: '/review-queue', label: 'Review overdue items', icon: 'clock' as const },
            { to: '/framework-lenses', label: 'Check framework lenses', icon: 'layers' as const },
            { to: '/reports', label: 'Generate the Management Overview report', icon: 'report' as const },
            { to: '/settings', label: 'Export a JSON backup', icon: 'download' as const },
            { to: '/review-queue', label: 'Open the Review Queue', icon: 'check' as const },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="flex items-center gap-2 rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-ink hover:border-border-strong hover:bg-elevated">
              <Icon name={a.icon} size={14} className="text-brand" /> {a.label}
            </Link>
          ))}
        </div>
      </Card>
    ),

    walkthrough: () => (
      <Card className="h-full">
        <CardHeader title="Suggested demo walkthrough" subtitle="A quick tour" actions={<Button size="sm" variant="ghost" onClick={loadSampleData}>Load sample</Button>} />
        <ol className={cn('text-sm text-muted', dense ? 'space-y-1 p-3' : 'space-y-1.5 p-4')}>
          {[
            { t: 'Load fictional sample data', to: '/settings' },
            { t: 'Open AI Systems', to: '/systems' },
            { t: 'Review a customer-facing AI system', to: '/systems' },
            { t: 'Check its risk flags', to: '/systems' },
            { t: 'Follow the traceability chain', to: '/systems' },
            { t: 'Open Framework Lenses', to: '/framework-lenses' },
            { t: 'Check GDPR or AI Security view', to: '/framework-lenses' },
            { t: 'Review Evidence Freshness', to: '/controls' },
            { t: 'Open Gap Actions', to: '/gap-actions' },
            { t: 'Generate a Single-System Audit Pack', to: '/reports' },
            { t: 'Export a JSON backup', to: '/settings' },
          ].map((s, i) => (
            <li key={i}>
              <Link to={s.to} className="flex items-start gap-2 hover:text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">{i + 1}</span>
                <span>{s.t}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Card>
    ),

    'risk-band': () => (
      <Card className="h-full">
        <CardHeader title="Systems by risk band" subtitle="Indicative only — not a legal classification" />
        <div className={cn('space-y-3', dense ? 'p-3' : 'p-4')}>
          {(Object.keys(stats.byRiskCategory) as RiskCategory[]).map((c) => {
            const n = stats.byRiskCategory[c];
            const pct = stats.totalSystems ? Math.round((n / stats.totalSystems) * 100) : 0;
            return (
              <div key={c}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{RISK_CATEGORY_LABELS[c]}</span>
                  <span className="font-medium text-ink">{n}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                  <div className={`h-full rounded-full ${RISK_TONE[c]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    ),

    'evidence-coverage': () => (
      <Card className="h-full">
        <CardHeader title="Evidence coverage" subtitle="Audit-readiness evidence coverage" />
        <div className={dense ? 'p-3' : 'p-4'}>
          <CoverageMeter pct={stats.coveragePct} documented={stats.coverageDocumented} expected={stats.coverageExpected} />
          <div className="mt-4 flex flex-wrap gap-2">
            {reviewFlags.map((f) => (
              <Chip key={f.label} tone={f.n ? 'warn' : 'neutral'}>{f.label}: {f.n}</Chip>
            ))}
          </div>
        </div>
      </Card>
    ),

    'needs-attention': () => (
      <Card className="h-full">
        <CardHeader title="Needs attention" subtitle="Overdue & due-soon reviews" actions={<Link to="/review-queue" className="text-xs text-brand hover:underline">Queue →</Link>} />
        <div className="divide-y divide-border">
          {attention.length === 0 ? (
            <p className="p-4 text-xs text-faint">Nothing overdue or due within 7 days. 🎉</p>
          ) : (
            attention.map((r) => (
              <div key={`${r.kind}-${r.id}`} className="flex items-center justify-between gap-2 px-4 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-ink">{r.title}</div>
                  <div className="text-xs text-faint capitalize">{r.kind} · {formatDate(r.date)} · {relativeReview(r.date)}</div>
                </div>
                <ReviewChip state={r.state} />
              </div>
            ))
          )}
        </div>
      </Card>
    ),

    'review-queue-preview': () => (
      <Card className="h-full">
        <CardHeader title="Review queue" subtitle="Time-based review load" actions={<Link to="/review-queue" className="text-xs text-brand hover:underline">Open →</Link>} />
        <div className="grid grid-cols-3 gap-2 p-4 text-center">
          <Link to="/review-queue"><div className="text-2xl font-bold text-danger">{stats.overdueReviews}</div><div className="text-xs text-faint">Overdue</div></Link>
          <Link to="/review-queue"><div className="text-2xl font-bold text-warn">{stats.due7}</div><div className="text-xs text-faint">Due ≤ 7d</div></Link>
          <Link to="/review-queue"><div className="text-2xl font-bold text-info">{stats.due30}</div><div className="text-xs text-faint">Due ≤ 30d</div></Link>
        </div>
      </Card>
    ),

    'vendor-review-preview': () => (
      <Card className="h-full">
        <CardHeader title="Vendor reviews" subtitle="Pending vendor reviews" actions={<Link to="/vendors" className="text-xs text-brand hover:underline">Open →</Link>} />
        <div className="p-4">
          <div className="text-2xl font-bold text-warn">{vendorsPending.length}</div>
          <ul className="mt-2 space-y-0.5">
            {vendorsPending.slice(0, 4).map((v) => (
              <li key={v.id} className="truncate text-xs text-muted">{v.vendorName}</li>
            ))}
            {vendorsPending.length === 0 && <li className="text-xs text-faint">No vendor reviews pending.</li>}
          </ul>
        </div>
      </Card>
    ),

    'intake-preview': () => (
      <Card className="h-full">
        <CardHeader title="Intake requests" subtitle="Pending intake reviews" actions={<Link to="/use-cases" className="text-xs text-brand hover:underline">Open →</Link>} />
        <div className="p-4">
          <div className="text-2xl font-bold text-info">{intakesPending.length}</div>
          <ul className="mt-2 space-y-0.5">
            {intakesPending.slice(0, 4).map((u) => (
              <li key={u.id} className="truncate text-xs text-muted">{u.requestTitle}</li>
            ))}
            {intakesPending.length === 0 && <li className="text-xs text-faint">No intake requests pending.</li>}
          </ul>
        </div>
      </Card>
    ),

    'systems-needing-attention': () => (
      <Card>
        <CardHeader
          title={`Systems needing attention (${attentionSystems.length})`}
          subtitle="Overdue reviews, review flags, missing oversight owner, logging or audit trail"
          actions={<Link to="/systems" className="text-xs text-brand hover:underline">All systems →</Link>}
        />
        {attentionSystems.length === 0 ? (
          <p className="p-4 text-xs text-faint">No systems need attention right now. 🎉</p>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
            {attentionSystems.map((s) => (
              <Link key={s.id} to={`/systems/${s.id}`} className="flex flex-col gap-2 bg-panel px-4 py-2.5 hover:bg-panel-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                  <div className="truncate text-xs text-faint">{s.owner || 'No owner'}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.reasons.map((r) => (
                    <Chip key={r} tone={r === 'Overdue review' ? 'danger' : 'warn'}>{r}</Chip>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    ),
  };

  const visible = reconcileOrder(prefs.sectionOrder).filter((id) => !prefs.hiddenSectionIds.includes(id));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`AI governance overview for ${data.organizationName}. Highlights what needs attention before an audit or internal review.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {demoSystem && (
              <Button variant="primary" onClick={() => startDemo(demoSystem.id)}>
                <Icon name="helper" size={14} /> {demoActive ? 'Resume guided demo' : 'Start guided demo'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setCustomizing(true)}>
              <Icon name="settings" size={14} /> Customize dashboard
            </Button>
          </div>
        }
      />

      {demoSystem && (
        <Card className="mb-4 overflow-hidden border-brand/30 bg-gradient-to-br from-brand/10 to-transparent">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                <Icon name="helper" size={13} /> Best place to start
              </div>
              <h3 className="mt-1 text-base font-semibold text-ink">Sample AI System: {demoSystem.systemName}</h3>
              <p className="mt-0.5 text-sm text-muted">
                Take the 7-step guided tour, or open the sample system directly to see risks,
                controls, evidence and an exportable audit pack in one place.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="primary" onClick={() => startDemo(demoSystem.id)}>
                <Icon name="helper" size={14} /> {demoActive ? 'Resume demo' : 'Start guided demo'}
              </Button>
              <Link to={`/systems/${demoSystem.id}`}>
                <Button variant="secondary">Open sample system</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className={cn('grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4', gap)} style={{ alignItems: 'start' }}>
        {visible.map((id) => (
          <div key={id} className={FULL_SECTIONS.has(id) ? 'lg:col-span-3 2xl:col-span-4' : ''}>
            {sections[id]()}
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-faint">
        This dashboard is a working overview, not an assurance statement. “Possible high-risk”,
        risk bands and review flags indicate where human (legal / privacy / security) review may be
        needed — they are not legal conclusions or a compliance score.
      </p>

      {customizing && <DashboardCustomizer onClose={() => setCustomizing(false)} />}
    </>
  );
}
