import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type Density = 'comfortable' | 'compact';
export type TextSize = 'normal' | 'large';
export type DefaultLens = 'ai-act' | 'gdpr' | 'iso' | 'nis2' | 'security' | 'evidence' | 'vendor' | 'management';
export type ReviewWindow = 7 | 14 | 30;
export type EvidenceWindow = 30 | 60 | 90;

export interface AppearanceState {
  theme: Theme;
  density: Density;
  textSize: TextSize;
  highContrast: boolean;
  // Workflow preferences
  defaultLens: DefaultLens;
  reviewWindow: ReviewWindow;
  evidenceWindow: EvidenceWindow;
  showAdvanced: boolean;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
  setTextSize: (t: TextSize) => void;
  setHighContrast: (v: boolean) => void;
  setDefaultLens: (l: DefaultLens) => void;
  setReviewWindow: (w: ReviewWindow) => void;
  setEvidenceWindow: (w: EvidenceWindow) => void;
  setShowAdvanced: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  theme: 'dark' as Theme,
  density: 'comfortable' as Density,
  textSize: 'normal' as TextSize,
  highContrast: false,
  defaultLens: 'ai-act' as DefaultLens,
  reviewWindow: 7 as ReviewWindow,
  evidenceWindow: 30 as EvidenceWindow,
  showAdvanced: true,
};

export const useAppearance = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setTextSize: (textSize) => set({ textSize }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setDefaultLens: (defaultLens) => set({ defaultLens }),
      setReviewWindow: (reviewWindow) => set({ reviewWindow }),
      setEvidenceWindow: (evidenceWindow) => set({ evidenceWindow }),
      setShowAdvanced: (showAdvanced) => set({ showAdvanced }),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: 'ai-compliance-workspace:appearance', version: 2 }
  )
);
