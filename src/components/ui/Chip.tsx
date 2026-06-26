import { cn } from './cn';

export type Tone =
  | 'neutral'
  | 'brand'
  | 'info'
  | 'ok'
  | 'warn'
  | 'danger'
  | 'critical'
  | 'violet';

// Explicit class strings so Tailwind's scanner keeps them in the build.
const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-elevated text-muted ring-1 ring-border',
  brand: 'bg-brand/15 text-brand ring-1 ring-brand/30',
  info: 'bg-info/15 text-info ring-1 ring-info/30',
  ok: 'bg-ok/15 text-ok ring-1 ring-ok/30',
  warn: 'bg-warn/15 text-warn ring-1 ring-warn/30',
  danger: 'bg-danger/15 text-danger ring-1 ring-danger/30',
  critical: 'bg-critical/20 text-critical ring-1 ring-critical/40',
  violet: 'bg-violet/15 text-violet ring-1 ring-violet/30',
};

export function Chip({
  children,
  tone = 'neutral',
  className,
  title,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
