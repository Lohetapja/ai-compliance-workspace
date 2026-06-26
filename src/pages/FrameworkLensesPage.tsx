import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Icon } from '../components/ui/Icon';
import { cn } from '../components/ui/cn';
import {
  EvidenceStatusChip,
  FreshnessChip,
  RiskCategoryChip,
  SeverityChip,
} from '../components/ui/statusChips';
import { formatDate } from '../lib/dates';
import { evidenceFreshness } from '../lib/freshness';
import { systemName } from '../lib/selectors';
import {
  AI_SECURITY_CATEGORIES,
  aiActBuckets,
  auditEvidenceBuckets,
  gdprSystems,
  iso42001Areas,
  nis2Rows,
  securityRelevantRisks,
} from '../lib/lenses';
import type { AISystem } from '../types';

type Lens = 'ai-act' | 'iso' | 'gdpr' | 'nis2' | 'security' | 'evidence';

const LENSES: { id: Lens; label: string }[] = [
  { id: 'ai-act', label: 'AI Act View' },
  { id: 'iso', label: 'ISO 42001 View' },
  { id: 'gdpr', label: 'GDPR View' },
  { id: 'nis2', label: 'NIS2 View' },
  { id: 'security', label: 'AI Security View' },
  { id: 'evidence', label: 'Audit Evidence View' },
];

function SystemLink({ s }: { s: AISystem }) {
  return (
    <Link to={`/systems/${s.id}`} className="text-sm text-ink hover:text-brand hover:underline">
      {s.systemName}
    </Link>
  );
}

const tri = (v: string) => <span className="capitalize">{v}</span>;

export function FrameworkLensesPage() {
  const data = useStore((s) => s.data);
  const [lens, setLens] = useState<Lens>('ai-act');

  const aiAct = useMemo(() => aiActBuckets(data), [data]);
  const iso = useMemo(() => iso42001Areas(data), [data]);
  const gdpr = useMemo(() => gdprSystems(data), [data]);
  const nis2 = useMemo(() => nis2Rows(data), [data]);
  const secRisks = useMemo(() => securityRelevantRisks(data), [data]);
  const evidence = useMemo(() => auditEvidenceBuckets(data), [data]);

  return (
    <>
      <PageHeader
        title="Framework Lenses"
        description="High-level organizational views of the same workspace data through different governance angles. Indicative only."
      />

      <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
        <Icon name="warning" size={14} className="mr-1 inline" />
        Framework lenses are high-level organizational views. They do not provide legal advice,
        certification, or final compliance determination, and they do not reproduce official
        framework text.
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {LENSES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLens(l.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors',
              lens === l.id ? 'bg-brand/20 text-brand ring-brand/40' : 'bg-panel text-muted ring-border hover:text-ink'
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* ---------------- AI Act ---------------- */}
      {lens === 'ai-act' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {aiAct.map((b) => (
            <Card key={b.key}>
              <CardHeader title={b.label} subtitle={`${b.systems.length} system(s)`} />
              <div className="p-4">
                {b.systems.length === 0 ? (
                  <p className="text-xs text-faint">None.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {b.systems.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <SystemLink s={s} />
                        <RiskCategoryChip value={s.riskCategory} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
          <p className="md:col-span-2 text-xs text-faint">
            Labels such as &ldquo;possible elevated-risk context&rdquo; and &ldquo;legal review
            recommended&rdquo; are indicative review prompts, not legal conclusions about the EU AI Act.
          </p>
        </div>
      )}

      {/* ---------------- ISO 42001 ---------------- */}
      {lens === 'iso' && (
        <div className="space-y-3">
          <p className="text-xs text-faint">
            ISO/IEC 42001-inspired governance areas — high-level organization only, not the standard text.
          </p>
          {iso.map((a) => (
            <Card key={a.key} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">{a.key}</h3>
                  <p className="text-xs text-muted">{a.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip tone="info">{a.controls.length} controls</Chip>
                  <Chip tone="ok">{a.evidence.length} evidence</Chip>
                  <Chip tone={a.gapCount ? 'danger' : 'neutral'}>{a.gapCount} open gaps</Chip>
                  <Chip tone={a.status === 'on-track' ? 'ok' : a.status === 'no-controls' ? 'neutral' : 'warn'}>
                    {a.status === 'on-track' ? 'On track' : a.status === 'no-controls' ? 'No controls' : 'Needs attention'}
                  </Chip>
                </div>
              </div>
              {(a.controls.length > 0 || a.owner) && (
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                  {a.owner && <span>Owner: <span className="text-ink">{a.owner}</span></span>}
                  {a.controls.length > 0 && (
                    <span className="truncate">Controls: {a.controls.map((c) => c.controlTitle).join(', ')}</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ---------------- GDPR ---------------- */}
      {lens === 'gdpr' && (
        <div className="space-y-3">
          <p className="text-xs text-faint">
            GDPR-relevant privacy review view — only systems where personal or sensitive data is involved.
          </p>
          {gdpr.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-faint">
              No systems currently flag personal or sensitive data.
            </p>
          ) : (
            gdpr.map((s) => {
              const linkedEvidence = data.evidence.filter(
                (e) => e.linkedAISystemIds.includes(s.id) && (e.evidenceType.includes('DPIA') || e.evidenceType.includes('privacy') || e.frameworkTags.includes('GDPR'))
              );
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <SystemLink s={s} />
                    <div className="flex flex-wrap gap-1.5">
                      {s.personalDataInvolved === 'yes' && <Chip tone="warn">Personal data</Chip>}
                      {s.sensitiveDataInvolved === 'yes' && <Chip tone="danger">Sensitive data</Chip>}
                      {s.automatedDecisionConcern && <Chip tone="danger">Automated decision concern</Chip>}
                      {s.privacyReviewNeeded && <Chip tone="warn">Privacy review recommended</Chip>}
                      {s.dpiaStatus && <Chip tone={s.dpiaStatus === 'complete' ? 'ok' : 'warn'}>DPIA: {s.dpiaStatus}</Chip>}
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <Detail label="Data subjects" value={s.dataSubjects} />
                    <Detail label="Data categories" value={s.personalDataCategories} />
                    <Detail label="Purpose" value={s.businessPurpose} />
                    <Detail label="Recipients / vendors" value={s.recipientsOrVendors || s.vendorOrProvider} />
                    <Detail label="Retention note" value={s.retentionPeriod} />
                    <Detail label="Intl. transfer" value={s.internationalTransferFlag ? 'Yes' : 'No / unknown'} />
                  </dl>
                  <div className="mt-2 text-xs text-muted">
                    Linked privacy evidence: {linkedEvidence.length === 0 ? <span className="text-warn">none — open privacy gap</span> : linkedEvidence.map((e) => e.evidenceTitle).join(', ')}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ---------------- NIS2 ---------------- */}
      {lens === 'nis2' && (
        <div className="space-y-3">
          <p className="text-xs text-faint">NIS2-relevant cybersecurity evidence view — systems grouped by security-relevant attributes.</p>
          {nis2.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-faint">No systems currently raise NIS2-relevant flags.</p>
          ) : (
            nis2.map((row) => (
              <Card key={row.system.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <SystemLink s={row.system} />
                  <div className="text-xs text-faint">{row.system.deploymentEnvironment || '—'}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {row.flags.map((f) => (
                    <Chip key={f} tone={f.startsWith('Missing') || f === 'Open incident' || f === 'Overdue review' ? 'danger' : 'warn'}>{f}</Chip>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ---------------- AI Security ---------------- */}
      {lens === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="AI security risk areas" subtitle="Inspired by OWASP LLM Top 10 and AI security practice" />
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {AI_SECURITY_CATEGORIES.map((c) => {
                const count = secRisks.filter((r) => r.riskTitle.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())).length;
                return (
                  <div key={c.name} className="rounded-lg border border-border bg-panel-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{c.name}</span>
                      {count > 0 && <Chip tone="warn">{count}</Chip>}
                    </div>
                    <p className="mt-1 text-xs text-faint">{c.hint}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title={`Security-relevant risks (${secRisks.length})`} subtitle="From the risk register (OWASP/MITRE-tagged or AI security category)" />
            <div className="divide-y divide-border">
              {secRisks.length === 0 ? (
                <p className="p-4 text-xs text-faint">No security-relevant risks recorded.</p>
              ) : (
                secRisks.map((r) => {
                  const incidents = data.incidents.filter((i) => i.relatedRiskIds.includes(r.id));
                  const gaps = (data.gapActions ?? []).filter((g) => g.linkedRiskId === r.id);
                  return (
                    <div key={r.id} className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-ink">{r.riskTitle}</div>
                        <div className="truncate text-xs text-faint">
                          {systemName(data, r.affectedAISystemId)} · {r.linkedControlIds.length} controls · {r.linkedEvidenceIds.length} evidence
                          {incidents.length > 0 && ` · ${incidents.length} incident(s)`}
                          {gaps.length > 0 && ` · ${gaps.length} gap action(s)`}
                        </div>
                      </div>
                      <SeverityChip value={r.severity} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- Audit Evidence ---------------- */}
      {lens === 'evidence' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat n={evidence.missing.length} label="Missing / no date" tone="danger" />
            <Stat n={evidence.expired.length} label="Expired" tone="danger" />
            <Stat n={evidence.dueSoon.length} label="Due soon" tone="warn" />
            <Stat n={evidence.fresh.length} label="Fresh" tone="ok" />
          </div>
          <Card>
            <CardHeader title="Evidence readiness" subtitle="Freshness derived from status and review date" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-panel-2 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-3 py-2.5">Evidence</th>
                    <th className="px-3 py-2.5">Owner</th>
                    <th className="px-3 py-2.5">Systems</th>
                    <th className="px-3 py-2.5">Review</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Freshness</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evidence.map((e) => (
                    <tr key={e.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="text-ink">{e.evidenceTitle}</div>
                        <div className="text-xs text-faint">{e.evidenceType}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted">{e.owner || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-muted">{e.linkedAISystemIds.map((id) => systemName(data, id)).join(', ') || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-muted">{formatDate(e.reviewDate)}</td>
                      <td className="px-3 py-2.5"><EvidenceStatusChip value={e.status} /></td>
                      <td className="px-3 py-2.5"><FreshnessChip value={evidenceFreshness(e)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value ? tri(value) : <span className="text-faint">—</span>}</dd>
    </div>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: 'danger' | 'warn' | 'ok' }) {
  const color = tone === 'danger' ? 'text-danger' : tone === 'warn' ? 'text-warn' : 'text-ok';
  return (
    <Card className="p-3">
      <div className={cn('text-2xl font-bold', color)}>{n}</div>
      <div className="text-xs text-muted">{label}</div>
    </Card>
  );
}
