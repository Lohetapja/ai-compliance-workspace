import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Select, TriSelect } from '../components/ui/Field';
import { Chip } from '../components/ui/Chip';
import { RiskCategoryChip } from '../components/ui/statusChips';
import {
  HELPER_QUESTIONS,
  HELPER_DISCLAIMER,
  classify,
  emptyAnswers,
  type ReviewFlagKey,
} from '../lib/riskHelper';
import type { ClassificationAnswers } from '../types';
import { nowISO } from '../lib/id';

const FLAG_LABEL: Record<ReviewFlagKey, string> = {
  legal: 'Legal',
  privacy: 'Privacy',
  security: 'Security',
  vendor: 'Vendor',
  humanOversight: 'Human oversight',
};

export function RiskHelperPage() {
  const location = useLocation();
  const presetSystemId = (location.state as { systemId?: string } | null)?.systemId ?? '';
  const data = useStore((s) => s.data);
  const patchSystem = useStore((s) => s.patchSystem);

  const [systemId, setSystemId] = useState(presetSystemId);
  const [answers, setAnswers] = useState<ClassificationAnswers>(() => {
    const preset = data.systems.find((s) => s.id === presetSystemId)?.classification?.answers;
    return preset && Object.keys(preset).length ? { ...emptyAnswers(), ...preset } : emptyAnswers();
  });
  const [applied, setApplied] = useState(false);

  const result = useMemo(() => classify(answers), [answers]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof HELPER_QUESTIONS>();
    for (const q of HELPER_QUESTIONS) {
      const arr = map.get(q.group) ?? [];
      arr.push(q);
      map.set(q.group, arr);
    }
    return [...map.entries()];
  }, []);

  const answeredCount = Object.values(answers).filter((v) => v !== 'unknown').length;

  function applyToSystem() {
    if (!systemId) return;
    patchSystem(systemId, {
      classification: { ...result, ranAt: nowISO() },
      riskCategory: result.suggestedCategory,
      legalReviewNeeded: result.reviewFlags.legal,
      privacyReviewNeeded: result.reviewFlags.privacy,
      securityReviewNeeded: result.reviewFlags.security,
      vendorReviewNeeded: result.reviewFlags.vendor,
      humanOversightReviewNeeded: result.reviewFlags.humanOversight,
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  }

  const activeFlags = (Object.keys(result.reviewFlags) as ReviewFlagKey[]).filter(
    (k) => result.reviewFlags[k]
  );

  return (
    <>
      <PageHeader
        title="Risk Classification Helper"
        description="A guided questionnaire that highlights where review may be needed. It does not give a legal classification or compliance status."
      />

      <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
        <Icon name="warning" size={14} className="mr-1 inline" />
        {HELPER_DISCLAIMER}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Questionnaire */}
        <div className="space-y-4 lg:col-span-2">
          {groups.map(([group, qs]) => (
            <Card key={group}>
              <CardHeader title={group} />
              <div className="divide-y divide-border">
                {qs.map((q) => (
                  <div key={q.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm text-ink">{q.text}</p>
                      {q.help && <p className="mt-0.5 text-[11px] text-faint">{q.help}</p>}
                    </div>
                    <div className="shrink-0">
                      <TriSelect
                        value={answers[q.id] ?? 'unknown'}
                        onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-xs text-faint">{answeredCount}/{HELPER_QUESTIONS.length} answered</span>
            <Button variant="ghost" onClick={() => setAnswers(emptyAnswers())}>
              Reset answers
            </Button>
          </div>
        </div>

        {/* Result (sticky) */}
        <div className="space-y-4">
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader title="Possible risk area" subtitle="Indicative — not a legal determination" />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <RiskCategoryChip value={result.suggestedCategory} />
                </div>
                <p className="text-xs leading-relaxed text-muted">{result.summary}</p>

                <div>
                  <div className="label">Review flags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFlags.length === 0 ? (
                      <span className="text-xs text-faint">None raised yet.</span>
                    ) : (
                      activeFlags.map((f) => <Chip key={f} tone="warn">{FLAG_LABEL[f]} review</Chip>)
                    )}
                  </div>
                </div>

                {result.recommendedActions.length > 0 && (
                  <div>
                    <div className="label">Recommended next actions</div>
                    <ul className="space-y-1">
                      {result.recommendedActions.map((a, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-ink">
                          <Icon name="chevron" size={12} className="mt-0.5 text-brand" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <Card className="mt-4">
              <CardHeader title="Apply to a system" subtitle="Saves this result, risk band & review flags" />
              <div className="space-y-2 p-4">
                <Select value={systemId} onChange={(e) => setSystemId(e.target.value)}>
                  <option value="">— choose a system —</option>
                  {data.systems.map((s) => (
                    <option key={s.id} value={s.id}>{s.systemName}</option>
                  ))}
                </Select>
                <Button variant="primary" className="w-full" disabled={!systemId} onClick={applyToSystem}>
                  {applied ? 'Applied ✓' : 'Apply result to system'}
                </Button>
                <p className="text-[11px] leading-snug text-faint">
                  This overwrites the system’s risk band and review flags with the helper’s output.
                  You can still edit them manually afterwards.
                </p>
              </div>
            </Card>

            {result.reasons.length > 0 && (
              <Card className="mt-4">
                <CardHeader title="Why this result" />
                <ul className="space-y-1 p-4">
                  {result.reasons.slice(0, 10).map((r, i) => (
                    <li key={i} className="text-[11px] leading-snug text-faint">• {r}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
