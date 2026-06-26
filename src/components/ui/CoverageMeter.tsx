import { cn } from './cn';

/**
 * "Evidence Coverage" meter. Deliberately NOT a compliance score — it only
 * reflects how much of the recommended evidence checklist has been documented.
 */
export function CoverageMeter({
  pct,
  documented,
  expected,
  size = 'md',
  showDisclaimer = true,
}: {
  pct: number;
  documented: number;
  expected: number;
  size?: 'sm' | 'md';
  showDisclaimer?: boolean;
}) {
  const tone =
    pct >= 75 ? 'bg-ok' : pct >= 40 ? 'bg-warn' : 'bg-danger';
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={cn('font-semibold text-ink', size === 'sm' ? 'text-sm' : 'text-2xl')}>
          {pct}%
        </span>
        <span className="text-xs text-muted">
          {documented}/{expected} documented
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${pct}%` }} />
      </div>
      {showDisclaimer && (
        <p className="mt-1.5 text-[11px] leading-snug text-faint">
          Evidence Coverage is not a compliance score. It only shows how much of the
          recommended evidence checklist has been documented.
        </p>
      )}
    </div>
  );
}
