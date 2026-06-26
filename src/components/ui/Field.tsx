import { cn } from './cn';
import { InfoTip } from './Tooltip';

export function Field({
  label,
  term,
  hint,
  children,
  className,
}: {
  label: string;
  term?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="label flex items-center">
        {label}
        {term && <InfoTip term={term} />}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('input', props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('input', props.className)} />;
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn('input pr-8', props.className)}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
        ▾
      </span>
    </div>
  );
}

/** yes / no / unknown segmented control. */
export function TriSelect({
  value,
  onChange,
}: {
  value: 'yes' | 'no' | 'unknown';
  onChange: (v: 'yes' | 'no' | 'unknown') => void;
}) {
  const opts: ('yes' | 'no' | 'unknown')[] = ['yes', 'no', 'unknown'];
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
            value === o
              ? o === 'yes'
                ? 'bg-ok/20 text-ok'
                : o === 'no'
                  ? 'bg-danger/20 text-danger'
                  : 'bg-elevated text-ink'
              : 'text-muted hover:bg-elevated'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  term,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  term?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border bg-bg accent-brand"
      />
      <span className="flex items-center">
        {label}
        {term && <InfoTip term={term} />}
      </span>
    </label>
  );
}

/** Toggle a set of string values (e.g. framework tags) shown as chips. */
export function TagPicker<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium ring-1 transition-colors',
              on
                ? 'bg-brand/20 text-brand ring-brand/40'
                : 'bg-elevated text-muted ring-border hover:text-ink'
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Checkbox list to link related entities by id. */
export function LinkPicker({
  options,
  selected,
  onToggle,
  emptyText = 'Nothing to link yet.',
}: {
  options: { id: string; label: string; sub?: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyText?: string;
}) {
  if (options.length === 0)
    return <p className="text-xs text-faint">{emptyText}</p>;
  return (
    <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border bg-bg p-2">
      {options.map((o) => (
        <label
          key={o.id}
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-elevated"
        >
          <input
            type="checkbox"
            checked={selected.includes(o.id)}
            onChange={() => onToggle(o.id)}
            className="h-3.5 w-3.5 accent-brand"
          />
          <span className="min-w-0 truncate text-xs text-ink">
            {o.label}
            {o.sub && <span className="ml-1 text-faint">· {o.sub}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
