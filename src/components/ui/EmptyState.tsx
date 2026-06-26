export function EmptyState({
  icon = '◇',
  title,
  hint,
  action,
}: {
  icon?: string;
  title: string;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-elevated text-lg text-brand">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {hint && <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
