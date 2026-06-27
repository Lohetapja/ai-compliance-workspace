import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardDensity = 'comfortable' | 'compact';
export type WorkspaceWidth = 'comfortable' | 'wide' | 'full';

/** Named dashboard sections, in their default order. */
export const DASHBOARD_SECTIONS = [
  'welcome',
  'stats',
  'framework-lenses',
  'what-to-do-next',
  'walkthrough',
  'risk-band',
  'evidence-coverage',
  'needs-attention',
  'systems-needing-attention',
  'review-queue-preview',
  'vendor-review-preview',
  'intake-preview',
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTIONS)[number];

export const SECTION_LABELS: Record<DashboardSectionId, string> = {
  welcome: 'Welcome',
  stats: 'Stat cards',
  'framework-lenses': 'Framework lenses',
  'what-to-do-next': 'What to do next',
  walkthrough: 'Suggested walkthrough',
  'risk-band': 'Systems by risk band',
  'evidence-coverage': 'Evidence coverage',
  'needs-attention': 'Needs attention (reviews)',
  'systems-needing-attention': 'Systems needing attention',
  'review-queue-preview': 'Review queue preview',
  'vendor-review-preview': 'Vendor reviews preview',
  'intake-preview': 'Intake requests preview',
};

const DEFAULTS = {
  hiddenSectionIds: [] as string[],
  sectionOrder: [...DASHBOARD_SECTIONS] as string[],
  density: 'comfortable' as DashboardDensity,
  workspaceWidth: 'wide' as WorkspaceWidth,
};

/** Reconcile a stored order with the current section catalog (drop unknown, append new). */
export function reconcileOrder(order: string[]): DashboardSectionId[] {
  const all = DASHBOARD_SECTIONS as readonly string[];
  const known = order.filter((id): id is DashboardSectionId => all.includes(id));
  const missing = DASHBOARD_SECTIONS.filter((id) => !known.includes(id));
  return [...known, ...missing];
}

export type PresetId = 'default' | 'governance' | 'security' | 'management';

const PRESET_VISIBLE: Record<PresetId, DashboardSectionId[]> = {
  default: [...DASHBOARD_SECTIONS],
  governance: ['stats', 'framework-lenses', 'evidence-coverage', 'systems-needing-attention', 'review-queue-preview', 'what-to-do-next'],
  security: ['stats', 'systems-needing-attention', 'needs-attention', 'review-queue-preview', 'vendor-review-preview', 'framework-lenses'],
  management: ['stats', 'evidence-coverage', 'risk-band', 'systems-needing-attention', 'review-queue-preview', 'what-to-do-next'],
};

interface DashboardPrefsState {
  hiddenSectionIds: string[];
  sectionOrder: string[];
  density: DashboardDensity;
  workspaceWidth: WorkspaceWidth;
  toggleSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  setDensity: (d: DashboardDensity) => void;
  setWorkspaceWidth: (w: WorkspaceWidth) => void;
  applyPreset: (p: PresetId) => void;
  reset: () => void;
}

export const useDashboardPrefs = create<DashboardPrefsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleSection: (id) =>
        set((s) => ({
          hiddenSectionIds: s.hiddenSectionIds.includes(id)
            ? s.hiddenSectionIds.filter((x) => x !== id)
            : [...s.hiddenSectionIds, id],
        })),
      moveSection: (id, dir) =>
        set((s) => {
          const order = reconcileOrder(s.sectionOrder) as string[];
          const i = order.indexOf(id);
          const j = i + dir;
          if (i === -1 || j < 0 || j >= order.length) return {};
          const next = order.slice();
          [next[i], next[j]] = [next[j], next[i]];
          return { sectionOrder: next };
        }),
      setDensity: (density) => set({ density }),
      setWorkspaceWidth: (workspaceWidth) => set({ workspaceWidth }),
      applyPreset: (p) => {
        const visible = PRESET_VISIBLE[p];
        const hidden = DASHBOARD_SECTIONS.filter((id) => !visible.includes(id));
        set({
          sectionOrder: [...visible, ...hidden],
          hiddenSectionIds: hidden,
        });
      },
      reset: () => set({ ...DEFAULTS, sectionOrder: [...DASHBOARD_SECTIONS] }),
    }),
    { name: 'ai-compliance-workspace:dashboard', version: 1 }
  )
);
