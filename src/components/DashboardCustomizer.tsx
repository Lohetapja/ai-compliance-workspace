import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { cn } from './ui/cn';
import {
  reconcileOrder,
  SECTION_LABELS,
  useDashboardPrefs,
  type DashboardDensity,
  type DashboardSectionId,
  type PresetId,
  type WorkspaceWidth,
} from '../store/useDashboardPrefs';

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            value === o.value ? 'bg-brand/20 text-brand' : 'text-muted hover:bg-elevated'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardCustomizer({ onClose }: { onClose: () => void }) {
  const {
    hiddenSectionIds,
    sectionOrder,
    density,
    workspaceWidth,
    toggleSection,
    moveSection,
    setDensity,
    setWorkspaceWidth,
    applyPreset,
    reset,
  } = useDashboardPrefs();

  const order = reconcileOrder(sectionOrder);

  function doReset() {
    if (confirm('Reset the dashboard layout to its default sections, order, density, and width?')) {
      reset();
    }
  }

  const presets: { id: PresetId; label: string }[] = [
    { id: 'default', label: 'Default' },
    { id: 'governance', label: 'Governance' },
    { id: 'security', label: 'Security' },
    { id: 'management', label: 'Management' },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Customize dashboard"
      subtitle="Show/hide and reorder sections, set density and workspace width. Saved in this browser."
      size="lg"
      footer={
        <>
          <Button variant="danger" onClick={doReset} className="mr-auto">Reset layout</Button>
          <Button variant="primary" onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="label">Dashboard density</div>
            <Seg<DashboardDensity>
              value={density}
              onChange={setDensity}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
          </div>
          <div>
            <div className="label">Workspace width</div>
            <Seg<WorkspaceWidth>
              value={workspaceWidth}
              onChange={setWorkspaceWidth}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'wide', label: 'Wide' },
                { value: 'full', label: 'Full' },
              ]}
            />
          </div>
        </div>

        <div>
          <div className="label">Presets</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button key={p.id} size="sm" variant="secondary" onClick={() => applyPreset(p.id)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Sections</div>
          <div className="space-y-1.5">
            {order.map((id, idx) => {
              const visible = !hiddenSectionIds.includes(id);
              return (
                <div key={id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-panel-2 px-3 py-2">
                  <label className="flex min-w-0 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => toggleSection(id)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className={cn('truncate text-sm', visible ? 'text-ink' : 'text-faint line-through')}>
                      {SECTION_LABELS[id as DashboardSectionId] ?? id}
                    </span>
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => moveSection(id, -1)}
                      className="rounded-md p-1 text-muted hover:bg-elevated hover:text-ink disabled:opacity-30"
                    >
                      <Icon name="chevron" size={14} className="-rotate-90" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={idx === order.length - 1}
                      onClick={() => moveSection(id, 1)}
                      className="rounded-md p-1 text-muted hover:bg-elevated hover:text-ink disabled:opacity-30"
                    >
                      <Icon name="chevron" size={14} className="rotate-90" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
