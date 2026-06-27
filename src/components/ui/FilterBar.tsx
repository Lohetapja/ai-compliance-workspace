import { Icon } from './Icon';

export interface FilterDef {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = 'Filter…',
  filters = [],
  right,
}: {
  /** Omit search + onSearch to render a filters-only bar (no dead search box). */
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  right?: React.ReactNode;
}) {
  const showSearch = typeof onSearch === 'function';
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {showSearch && (
        <div className="relative min-w-[180px] flex-1">
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" size={14} />
          <input
            value={search ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="input pl-8"
          />
        </div>
      )}
      {filters.map((f) => (
        <select
          key={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="input w-auto min-w-[130px]"
          aria-label={f.label}
        >
          <option value="">{f.label}: all</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
