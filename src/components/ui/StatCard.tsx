import { Link } from 'react-router-dom';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import type { Tone } from './Chip';

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-muted',
  brand: 'text-brand',
  info: 'text-info',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  critical: 'text-critical',
  violet: 'text-violet',
};

export function StatCard({
  label,
  value,
  tone = 'neutral',
  icon,
  hint,
  to,
  emphasize,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  icon?: IconName;
  hint?: string;
  to?: string;
  emphasize?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        'card h-full p-4 transition-colors',
        to && 'hover:border-border-strong hover:bg-panel-2',
        emphasize && 'ring-1 ring-inset',
        emphasize && tone === 'danger' && 'ring-danger/30',
        emphasize && tone === 'warn' && 'ring-warn/30'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {icon && <Icon name={icon} className={TONE_TEXT[tone]} />}
      </div>
      <div className={cn('mt-2 text-[28px] font-bold leading-none tracking-tight', TONE_TEXT[tone])}>{value}</div>
      {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
