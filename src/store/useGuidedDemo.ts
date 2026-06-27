import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Guided Demo Mode state. Progress (which step, which system) is persisted to
 * localStorage so a visitor can refresh mid-tour and pick up where they were.
 * This store only tracks tour position — it never mutates workspace data.
 */
interface GuidedDemoState {
  active: boolean;
  stepIndex: number;
  systemId: string | null;
  start: (systemId: string) => void;
  exit: () => void;
  restart: () => void;
  setStep: (i: number) => void;
  next: () => void;
  prev: () => void;
}

export const useGuidedDemo = create<GuidedDemoState>()(
  persist(
    (set) => ({
      active: false,
      stepIndex: 0,
      systemId: null,
      start: (systemId) => set({ active: true, stepIndex: 0, systemId }),
      exit: () => set({ active: false }),
      restart: () => set({ active: true, stepIndex: 0 }),
      setStep: (i) => set({ stepIndex: Math.max(0, i) }),
      next: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),
      prev: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),
    }),
    { name: 'ai-compliance-workspace:guided-demo', version: 1 }
  )
);
