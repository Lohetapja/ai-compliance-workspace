import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useGuidedDemo } from '../store/useGuidedDemo';
import { DEMO_STEPS, DEMO_STEP_COUNT, pickShowcaseSystem } from '../lib/demo';
import { singleSystemAuditPack } from '../lib/reports';
import { downloadText, slugify } from '../lib/download';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

/**
 * Floating Guided Demo panel. Mounted once in the app shell so it survives
 * route changes. Walks a first-time visitor through one AI system end-to-end.
 */
export function GuidedDemo() {
  const navigate = useNavigate();
  const data = useStore((s) => s.data);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const { active, stepIndex, systemId, exit, restart, next, prev } = useGuidedDemo();

  if (!active) return null;

  // Prefer the system the tour started on; fall back to the best showcase system.
  const system = data.systems.find((s) => s.id === systemId) ?? pickShowcaseSystem(data);

  // No systems at all — offer to load the fictional sample data first.
  if (!system) {
    return (
      <Shell onClose={exit} step={0}>
        <h3 className="text-sm font-semibold text-ink">Load the sample workspace</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          The guided demo needs at least one AI system. Load the fictional sample
          company to follow the full walkthrough.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="primary" onClick={loadSampleData}>Load sample data</Button>
          <Button size="sm" variant="ghost" onClick={exit}>Exit demo</Button>
        </div>
      </Shell>
    );
  }

  // Completed — past the last step.
  if (stepIndex >= DEMO_STEP_COUNT) {
    return (
      <Shell onClose={exit} step={DEMO_STEP_COUNT}>
        <h3 className="text-sm font-semibold text-ink">Demo complete 🎉</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          That is the core loop: classify a system, track its risks and controls,
          attach evidence, and export an audit-preparation pack. Explore freely —
          all data stays in your browser.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={restart}>Restart demo</Button>
          <Button size="sm" variant="ghost" onClick={exit}>Exit demo mode</Button>
        </div>
      </Shell>
    );
  }

  const step = DEMO_STEPS[stepIndex];

  function runStep() {
    if (step.audit) {
      const md = singleSystemAuditPack(data, system!);
      downloadText(`audit-pack-${slugify(system!.systemName)}.md`, md);
      next();
      return;
    }
    navigate(step.to(system!.id));
    if (step.anchor) {
      const anchor = step.anchor;
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 240);
    }
    next();
  }

  return (
    <Shell onClose={exit} step={stepIndex}>
      <div className="flex items-center gap-2 text-brand">
        <Icon name={step.icon} size={15} />
        <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.body}</p>

      <Button size="sm" variant="primary" className="mt-3 w-full" onClick={runStep}>
        {step.cta}
        <Icon name="chevron" size={13} />
      </Button>

      <div className="mt-2.5 flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={prev} disabled={stepIndex === 0}>Back</Button>
        <button onClick={restart} className="text-xs text-faint hover:text-muted">Restart</button>
        <Button size="sm" variant="ghost" onClick={next}>
          {stepIndex === DEMO_STEP_COUNT - 1 ? 'Skip' : 'Next'}
        </Button>
      </div>
    </Shell>
  );
}

/** Shared chrome: fixed card, progress dots, close button. */
function Shell({
  children,
  onClose,
  step,
}: {
  children: React.ReactNode;
  onClose: () => void;
  step: number;
}) {
  return (
    <div
      role="region"
      aria-label="Guided demo"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-brand/30 bg-panel p-4 shadow-2xl ring-1 ring-brand/10 sm:left-auto sm:w-[22rem]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
          <Icon name="helper" size={12} /> Guided demo
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-faint">
            {Math.min(step + 1, DEMO_STEP_COUNT)} / {DEMO_STEP_COUNT}
          </span>
          <button
            onClick={onClose}
            aria-label="Exit demo mode"
            className="rounded-md px-1.5 text-muted hover:bg-elevated hover:text-ink"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mb-3 flex gap-1">
        {DEMO_STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-elevated'}`}
          />
        ))}
      </div>

      {children}
    </div>
  );
}
