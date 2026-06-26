import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { searchWorkspace } from '../../lib/search';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import type { EntityKind } from '../../types';

const KIND_LABEL: Record<EntityKind, string> = {
  system: 'System',
  risk: 'Risk',
  control: 'Control',
  evidence: 'Evidence',
  decision: 'Decision',
  incident: 'Incident',
};

export function GlobalSearch() {
  const data = useStore((s) => s.data);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchWorkspace(data, q), [data, q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => setActive(0), [q]);

  function go(to: string) {
    navigate(to);
    setOpen(false);
    setQ('');
    inputRef.current?.blur();
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && results[active]) {
              go(results[active].to);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Search systems, risks, controls, evidence…  (Ctrl/⌘K)"
          className="input pl-9"
        />
      </div>

      {open && q && (
        <div className="absolute z-40 mt-1.5 max-h-96 w-full overflow-y-auto rounded-xl border border-border bg-panel-2 p-1.5 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-faint">
              No matches for “{q}”.
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.kind}-${r.id}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.to)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                  i === active ? 'bg-elevated' : ''
                }`}
              >
                <Chip tone="neutral" className="shrink-0">
                  {KIND_LABEL[r.kind]}
                </Chip>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{r.title}</span>
                  <span className="block truncate text-[11px] text-faint">{r.subtitle}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
