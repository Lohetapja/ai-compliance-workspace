import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { dashboardStats, reviewItems, systemsNeedingAttention } from '../lib/selectors';
import { lensCounts } from '../lib/lenses';
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

const RISK_TONE: Record<RiskCategory, string> = {
  unassessed: 'bg-faint',
  minimal: 'bg-ok',
  limited: 'bg-info',
  elevated: 'bg-warn',
  'high-review-needed': 'bg-danger',
};

export function DashboardPage() {
  const data = useStore((s) => s.data);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const stats = dashboardStats(data);
  const lens = lensCounts(data);
  const reviews = reviewItems(data);
  const attention = reviews.filter((r) => r.state === 'overdue' || r.state === 'due-7').slice(0, 8);
  const attentionSystems = systemsNeedingAttention(data);

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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`AI governance overview for ${data.organizationName}. Highlights what needs attention before an audit or internal review.`}
      />

      <Card className="mb-5">
        <CardHeader
          title="Welcome to AI Compliance Workspace"
          subtitle="A practical browser-based workspace for organizing AI systems, risks, controls, evidence, decisions, incidents, and audit-readiness information."
        />
        <div className="space-y-3 p-4 text-sm leading-relaxed text-muted">
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
            <Link to="/dashboard"><Button variant="ghost">View dashboard</Button></Link>
            <Link to="/about"><Button variant="ghost">Read disclaimer</Button></Link>
          </div>
        </div>
      </Card>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="AI systems" value={stats.totalSystems} icon="systems" tone="brand" to="/systems" />
        <StatCard label="Possible high-risk" value={stats.possibleHighRisk} icon="warning" tone="danger" to="/systems" hint="Review needed — not a legal determination" emphasize={stats.possibleHighRisk > 0} />
        <StatCard label="Open critical risks" value={stats.openCriticalRisks} icon="risk" tone="critical" to="/risks" emphasize={stats.openCriticalRisks > 0} />
        <StatCard label="Open incidents" value={stats.openIncidents} icon="incident" tone="warn" to="/incidents" emphasize={stats.openIncidents > 0} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Overdue reviews" value={stats.overdueReviews} tone={stats.overdueReviews ? 'danger' : 'ok'} icon="warning" />
        <StatCard label="Reviews due ≤ 7 days" value={stats.due7} tone={stats.due7 ? 'warn' : 'neutral'} />
        <StatCard label="Reviews due ≤ 30 days" value={stats.due30} tone="info" />
        <StatCard label="Open high risks" value={stats.openHighRisks} tone={stats.openHighRisks ? 'warn' : 'neutral'} to="/risks" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Controls without evidence" value={stats.controlsWithoutEvidence} tone={stats.controlsWithoutEvidence ? 'danger' : 'ok'} icon="controls" to="/controls" />
        <StatCard label="Missing evidence items" value={stats.missingEvidenceCount} tone={stats.missingEvidenceCount ? 'warn' : 'ok'} to="/controls" hint="From recommended checklist" />
        <StatCard label="Open gap actions" value={stats.openGapActions} tone={stats.openGapActions ? 'warn' : 'ok'} icon="warning" to="/gap-actions" />
        <StatCard label="Overdue gap actions" value={stats.overdueGapActions} tone={stats.overdueGapActions ? 'danger' : 'ok'} to="/gap-actions" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="High-severity gaps" value={stats.highSeverityGapActions} tone={stats.highSeverityGapActions ? 'danger' : 'ok'} to="/gap-actions" />
        <StatCard label="Vendor reviews pending" value={stats.vendorReview} tone={stats.vendorReview ? 'warn' : 'neutral'} to="/systems" />
        <StatCard label="Systems for legal review" value={stats.legalReview} tone={stats.legalReview ? 'warn' : 'neutral'} to="/systems" />
        <StatCard label="Evidence coverage" value={`${stats.coveragePct}%`} tone={stats.coveragePct >= 80 ? 'ok' : stats.coveragePct >= 50 ? 'warn' : 'danger'} to="/controls" />
      </div>

      {/* Inventory at a glance */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active systems" value={stats.activeSystems} tone="ok" icon="check" to="/systems" />
        <StatCard label="Customer-facing" value={stats.customerFacing} tone="info" to="/systems" />
        <StatCard label="With personal data" value={stats.withPersonalData} tone="warn" to="/systems" />
        <StatCard label="With sensitive data" value={stats.withSensitiveData} tone={stats.withSensitiveData ? 'danger' : 'neutral'} to="/systems" />
      </div>

      {/* Governance views & workflow */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendor reviews pending" value={lens.vendorReviewsPending} tone={lens.vendorReviewsPending ? 'warn' : 'ok'} icon="box" to="/vendors" />
        <StatCard label="Intake requests pending" value={lens.intakePending} tone={lens.intakePending ? 'info' : 'neutral'} icon="inbox" to="/use-cases" />
        <StatCard label="Expired evidence" value={lens.expiredEvidence} tone={lens.expiredEvidence ? 'danger' : 'ok'} to="/framework-lenses" />
        <StatCard label="Evidence due soon" value={lens.evidenceDueSoon} tone={lens.evidenceDueSoon ? 'warn' : 'ok'} to="/framework-lenses" />
      </div>

      <Card className="mt-5">
        <CardHeader title="Framework lenses" subtitle="View the same data through governance angles — indicative only, not compliance determinations" actions={<Link to="/framework-lenses" className="text-xs text-brand hover:underline">Open →</Link>} />
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'AI Act View', to: '/framework-lenses', hint: `${lens.aiActReviewAreas} review area(s)`, icon: 'layers' as const },
            { label: 'GDPR View', to: '/framework-lenses', hint: `${lens.gdprSystems} system(s)`, icon: 'shield' as const },
            { label: 'ISO 42001 View', to: '/framework-lenses', hint: 'management areas', icon: 'framework' as const },
            { label: 'NIS2 View', to: '/framework-lenses', hint: 'security evidence', icon: 'controls' as const },
            { label: 'AI Security View', to: '/framework-lenses', hint: `${lens.securityRisks} open risk(s)`, icon: 'risk' as const },
          ].map((v) => (
            <Link key={v.label} to={v.to} className="rounded-lg border border-border bg-panel-2 p-3 hover:border-border-strong hover:bg-elevated">
              <div className="flex items-center gap-1.5 text-sm font-medium text-ink"><Icon name={v.icon} size={14} className="text-brand" /> {v.label}</div>
              <div className="mt-1 text-xs text-faint">{v.hint}</div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Middle row */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Risk category breakdown */}
        <Card>
          <CardHeader title="Systems by risk band" subtitle="Indicative only — not a legal classification" />
          <div className="space-y-3 p-4">
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

        {/* Evidence coverage */}
        <Card>
          <CardHeader title="Evidence coverage" subtitle="How much recommended evidence is documented" />
          <div className="p-4">
            <CoverageMeter pct={stats.coveragePct} documented={stats.coverageDocumented} expected={stats.coverageExpected} />
            <div className="mt-4 flex flex-wrap gap-2">
              {reviewFlags.map((f) => (
                <Chip key={f.label} tone={f.n ? 'warn' : 'neutral'}>
                  {f.label}: {f.n}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* Needs attention: reviews */}
        <Card>
          <CardHeader
            title="Needs attention"
            subtitle="Overdue & due-soon reviews"
            actions={<Link to="/reports" className="text-xs text-brand hover:underline">Reports →</Link>}
          />
          <div className="divide-y divide-border">
            {attention.length === 0 ? (
              <p className="p-4 text-xs text-faint">Nothing overdue or due within 7 days. 🎉</p>
            ) : (
              attention.map((r) => (
                <div key={`${r.kind}-${r.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-ink">{r.title}</div>
                    <div className="text-xs text-faint capitalize">
                      {r.kind} · {formatDate(r.date)} · {relativeReview(r.date)}
                    </div>
                  </div>
                  <ReviewChip state={r.state} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Systems needing attention */}
      <Card className="mt-5">
        <CardHeader
          title={`Systems needing attention (${attentionSystems.length})`}
          subtitle="Overdue reviews, review flags, missing oversight owner, logging or audit trail"
          actions={<Link to="/systems" className="text-xs text-brand hover:underline">All systems →</Link>}
        />
        {attentionSystems.length === 0 ? (
          <p className="p-4 text-xs text-faint">No systems need attention right now. 🎉</p>
        ) : (
          <div className="divide-y divide-border">
            {attentionSystems.map((s) => (
              <Link
                key={s.id}
                to={`/systems/${s.id}`}
                className="flex flex-col gap-2 px-4 py-2.5 hover:bg-panel-2 sm:flex-row sm:items-center sm:justify-between"
              >
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

      <p className="mt-5 text-xs leading-relaxed text-faint">
        This dashboard is a working overview, not an assurance statement. “Possible high-risk”,
        risk bands and review flags indicate where human (legal / privacy / security) review may be
        needed — they are not legal conclusions or a compliance score.
      </p>
    </>
  );
}
