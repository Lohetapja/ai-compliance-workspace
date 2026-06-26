import { cn } from './cn';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Hide this column's label in the mobile card view (e.g. for the title row). */
  primary?: boolean;
  className?: string;
}

/**
 * Responsive table: a real <table> on md+ screens, and a stacked card list on
 * small screens (each row becomes a labelled card). One column definition feeds both.
 */
export function DataTable<T>({
  rows,
  columns,
  getKey,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-panel-2 text-left">
              {columns.map((c) => (
                <th
                  key={c.header}
                  className={cn(
                    'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted',
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-border/60 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-panel-2'
                )}
              >
                {columns.map((c) => (
                  <td key={c.header} className={cn('px-3 py-2.5 align-middle', c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {rows.map((row) => (
          <div
            key={getKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn('card p-3', onRowClick && 'cursor-pointer active:bg-panel-2')}
          >
            {columns.map((c, i) => (
              <div
                key={c.header}
                className={cn(
                  'flex items-start justify-between gap-3',
                  i === 0 ? 'mb-1.5' : 'border-t border-border/50 py-1.5'
                )}
              >
                {!c.primary && (
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
                    {c.header}
                  </span>
                )}
                <span className={cn('min-w-0 text-sm', c.primary ? 'font-semibold text-ink' : 'text-right')}>
                  {c.cell(row)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
