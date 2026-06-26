import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { FRAMEWORKS, REQUIREMENT_AREAS, type FrameworkId, type RequirementArea } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Icon } from '../components/ui/Icon';
import { Textarea } from '../components/ui/Field';
import { cn } from '../components/ui/cn';
import { controlLacksEvidence, isOpenRisk } from '../lib/selectors';

const UNSPECIFIED = 'Unspecified' as const;

export function FrameworksPage() {
  const data = useStore((s) => s.data);
  const upsertFrameworkNote = useStore((s) => s.upsertFrameworkNote);
  const [fw, setFw] = useState<FrameworkId>('EU AI Act');

  const areaRows = useMemo(() => {
    const areas: (RequirementArea | typeof UNSPECIFIED)[] = [...REQUIREMENT_AREAS, UNSPECIFIED];
    return areas
      .map((area) => {
        const matchArea = (a?: string) => (area === UNSPECIFIED ? !a : a === area);
        const controls = data.controls.filter((c) => c.frameworkTags.includes(fw) && matchArea(c.requirementArea));
        const risks = data.risks.filter((r) => r.frameworkTags.includes(fw) && matchArea(r.requirementArea));
        const controlIds = new Set(controls.map((c) => c.id));
        const evidence = data.evidence.filter(
          (e) => e.frameworkTags.includes(fw) && e.linkedControlIds.some((id) => controlIds.has(id))
        );
        const riskIds = new Set(risks.map((r) => r.id));
        const evidenceIds = new Set(evidence.map((e) => e.id));
        const gapActions = (data.gapActions ?? []).filter(
          (g) =>
            g.status !== 'done' &&
            g.status !== 'accepted-risk' &&
            (controlIds.has(g.linkedControlId) ||
              riskIds.has(g.linkedRiskId) ||
              evidenceIds.has(g.linkedEvidenceId))
        );
        const openGaps =
          controls.filter((c) => c.status !== 'implemented' || controlLacksEvidence(c, data)).length +
          risks.filter(isOpenRisk).length +
          gapActions.length;
        const note = data.frameworkNotes.find(
          (n) => n.framework === fw && n.requirementArea === (area === UNSPECIFIED ? 'Governance' : area)
        );
        return { area, controls, risks, evidence, gapActions, openGaps, note };
      })
      .filter((r) => r.controls.length || r.risks.length || r.evidence.length || r.gapActions.length || r.note);
  }, [data, fw]);

  const totals = useMemo(() => {
    const controls = data.controls.filter((c) => c.frameworkTags.includes(fw)).length;
    const risks = data.risks.filter((r) => r.frameworkTags.includes(fw)).length;
    const evidence = data.evidence.filter((e) => e.frameworkTags.includes(fw)).length;
    const systems = data.systems.filter((s) => s.frameworkTags.includes(fw)).length;
    return { controls, risks, evidence, systems };
  }, [data, fw]);

  return (
    <>
      <PageHeader
        title="Framework Mapping"
        description="High-level mapping of your work to framework requirement areas. Indicative orientation only — it does not reproduce standard text or interpret the law."
      />

      <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
        <Icon name="warning" size={14} className="mr-1 inline" />
        Framework mapping is high-level and for organization only. It does not reproduce official framework text and does not determine compliance.
      </div>

      {/* Framework selector */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FRAMEWORKS.map((f) => (
          <button
            key={f}
            onClick={() => setFw(f)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors',
              fw === f ? 'bg-brand/20 text-brand ring-brand/40' : 'bg-panel text-muted ring-border hover:text-ink'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3"><div className="text-xs text-muted">Systems tagged</div><div className="mt-1 text-xl font-semibold text-ink">{totals.systems}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted">Controls tagged</div><div className="mt-1 text-xl font-semibold text-ink">{totals.controls}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted">Risks tagged</div><div className="mt-1 text-xl font-semibold text-ink">{totals.risks}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted">Evidence tagged</div><div className="mt-1 text-xl font-semibold text-ink">{totals.evidence}</div></Card>
      </div>

      {areaRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-faint">
          Nothing is tagged with <strong className="text-muted">{fw}</strong> yet. Add the framework tag to
          controls, risks, evidence, or systems to populate this mapping.
        </p>
      ) : (
        <div className="space-y-3">
          {areaRows.map(({ area, controls, risks, evidence, gapActions, openGaps, note }) => (
            <Card key={area} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{area}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Chip tone="info">{controls.length} controls</Chip>
                  <Chip tone="violet">{risks.length} risks</Chip>
                  <Chip tone="ok">{evidence.length} evidence</Chip>
                  <Chip tone={openGaps ? 'danger' : 'neutral'}>{openGaps} open gaps</Chip>
                </div>
              </div>

              {(controls.length > 0 || risks.length > 0 || gapActions.length > 0) && (
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {controls.length > 0 && (
                    <div>
                      <div className="label">Related controls</div>
                      <ul className="space-y-0.5">
                        {controls.map((c) => (
                          <li key={c.id} className="flex items-center gap-1.5 text-xs text-muted">
                            {controlLacksEvidence(c, data) && <Icon name="warning" size={11} className="text-warn" />}
                            <span className="truncate">{c.controlTitle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {risks.length > 0 && (
                    <div>
                      <div className="label">Related risks</div>
                      <ul className="space-y-0.5">
                        {risks.map((r) => (
                          <li key={r.id} className="truncate text-xs text-muted">{r.riskTitle}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {gapActions.length > 0 && (
                    <div>
                      <div className="label">Open gap actions</div>
                      <ul className="space-y-0.5">
                        {gapActions.map((g) => (
                          <li key={g.id} className="truncate text-xs text-muted">
                            {g.title} ({g.status}, {g.owner || 'no owner'})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3">
                <div className="label">Notes (high-level)</div>
                <Textarea
                  defaultValue={note?.notes ?? ''}
                  placeholder="High-level mapping notes — e.g. which obligations this area relates to and what still needs legal review."
                  onBlur={(e) => upsertFrameworkNote(fw, area === UNSPECIFIED ? 'Governance' : area, e.target.value)}
                  className="min-h-16 text-xs"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
