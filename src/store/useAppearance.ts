import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type Density = 'comfortable' | 'compact';
export type TextSize = 'normal' | 'large';

export interface AppearanceState {
  theme: Theme;
  density: Density;
  textSize: TextSize;
  highContrast: boolean;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
  setTextSize: (t: TextSize) => void;
  setHighContrast: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  theme: 'dark' as Theme,
  density: 'comfortable' as Density,
  textSize: 'normal' as TextSize,
  highContrast: false,
};

export const useAppearance = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setTextSize: (textSize) => set({ textSize }),
      setHighContrast: (highContrast) => set({ highContrast }),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: 'ai-compliance-workspace:appearance' }
  )
);
