import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatTime } from '../../lib/dates';

/** Shows "Autosaved locally · HH:MM" — reflects the persisted localStorage write. */
export function AutosaveIndicator() {
  const lastSaved = useStore((s) => s.lastSaved);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!lastSaved) return;
    setJustSaved(true);
    const t = setTimeout(() => setJustSaved(false), 1500);
    return () => clearTimeout(t);
  }, [lastSaved]);

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-faint" title="Data is stored only in this browser (localStorage).">
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors ${
          justSaved ? 'bg-ok' : 'bg-faint'
        }`}
      />
      {lastSaved ? (
        <span>
          Autosaved locally · {formatTime(lastSaved)}
        </span>
      ) : (
        <span>Not saved yet</span>
      )}
    </div>
  );
}
