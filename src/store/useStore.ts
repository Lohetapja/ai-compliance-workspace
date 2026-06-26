import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AIRisk,
  AISystem,
  Control,
  Decision,
  Evidence,
  FrameworkId,
  FrameworkNote,
  Incident,
  RequirementArea,
  WorkspaceData,
  WorkspaceExport,
} from '../types';
import { emptyWorkspace } from '../data/empty';
import { newId, nowISO } from '../lib/id';
import { sampleWorkspace } from '../data/sampleData';

const STORAGE_KEY = 'ai-compliance-workspace:v1';
const EXPORT_VERSION = 1;

interface StoreState {
  data: WorkspaceData;
  lastSaved: string | null;

  // meta
  setOrganizationName: (name: string) => void;

  // generic-ish entity ops (one set per collection, kept explicit for clarity)
  upsertSystem: (s: AISystem) => void;
  patchSystem: (id: string, patch: Partial<AISystem>) => void;
  removeSystem: (id: string) => void;
  duplicateSystem: (id: string) => string | null;
  archiveSystem: (id: string) => void;

  upsertRisk: (r: AIRisk) => void;
  patchRisk: (id: string, patch: Partial<AIRisk>) => void;
  removeRisk: (id: string) => void;

  upsertControl: (c: Control) => void;
  patchControl: (id: string, patch: Partial<Control>) => void;
  removeControl: (id: string) => void;

  upsertEvidence: (e: Evidence) => void;
  patchEvidence: (id: string, patch: Partial<Evidence>) => void;
  removeEvidence: (id: string) => void;

  upsertDecision: (d: Decision) => void;
  patchDecision: (id: string, patch: Partial<Decision>) => void;
  removeDecision: (id: string) => void;

  upsertIncident: (i: Incident) => void;
  patchIncident: (id: string, patch: Partial<Incident>) => void;
  removeIncident: (id: string) => void;

  upsertFrameworkNote: (
    framework: FrameworkId,
    area: RequirementArea,
    notes: string
  ) => void;

  // workspace-level data operations
  loadSampleData: () => void;
  resetSampleData: () => void;
  clearAll: () => void;
  importData: (incoming: WorkspaceExport | WorkspaceData) => void;
  exportData: () => WorkspaceExport;
}

function touch<T extends { updatedAt: string }>(entity: T): T {
  return { ...entity, updatedAt: nowISO() };
}

/** Replace if id exists, else append. */
function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}

function patch<T extends { id: string; updatedAt: string }>(
  list: T[],
  id: string,
  p: Partial<T>
): T[] {
  return list.map((x) => (x.id === id ? touch({ ...x, ...p }) : x));
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: emptyWorkspace(),
      lastSaved: null,

      setOrganizationName: (name) =>
        set((s) => ({
          data: { ...s.data, organizationName: name },
          lastSaved: nowISO(),
        })),

      /* ---- AI systems ---- */
      upsertSystem: (sys) =>
        set((s) => ({
          data: { ...s.data, systems: upsert(s.data.systems, touch(sys)) },
          lastSaved: nowISO(),
        })),
      patchSystem: (id, p) =>
        set((s) => ({
          data: { ...s.data, systems: patch(s.data.systems, id, p) },
          lastSaved: nowISO(),
        })),
      removeSystem: (id) =>
        set((s) => {
          // Cascade: unlink this system from everything that referenced it.
          const data = s.data;
          return {
            data: {
              ...data,
              systems: data.systems.filter((x) => x.id !== id),
              risks: data.risks.map((r) =>
                r.affectedAISystemId === id ? { ...r, affectedAISystemId: '' } : r
              ),
              controls: data.controls.map((c) => ({
                ...c,
                affectedAISystemIds: c.affectedAISystemIds.filter((x) => x !== id),
              })),
              evidence: data.evidence.map((e) => ({
                ...e,
                linkedAISystemIds: e.linkedAISystemIds.filter((x) => x !== id),
              })),
              decisions: data.decisions.map((d) =>
                d.affectedAISystemId === id ? { ...d, affectedAISystemId: '' } : d
              ),
              incidents: data.incidents.map((i) =>
                i.affectedAISystemId === id ? { ...i, affectedAISystemId: '' } : i
              ),
            },
            lastSaved: nowISO(),
          };
        }),
      duplicateSystem: (id) => {
        const src = get().data.systems.find((x) => x.id === id);
        if (!src) return null;
        const copy: AISystem = {
          ...src,
          id: newId('sys'),
          systemName: `${src.systemName} (copy)`,
          currentStatus: 'draft',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({
          data: { ...s.data, systems: [...s.data.systems, copy] },
          lastSaved: nowISO(),
        }));
        return copy.id;
      },
      archiveSystem: (id) =>
        set((s) => ({
          data: { ...s.data, systems: patch(s.data.systems, id, { currentStatus: 'archived' }) },
          lastSaved: nowISO(),
        })),

      /* ---- risks ---- */
      upsertRisk: (r) =>
        set((s) => ({
          data: { ...s.data, risks: upsert(s.data.risks, touch(r)) },
          lastSaved: nowISO(),
        })),
      patchRisk: (id, p) =>
        set((s) => ({
          data: { ...s.data, risks: patch(s.data.risks, id, p) },
          lastSaved: nowISO(),
        })),
      removeRisk: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            risks: s.data.risks.filter((x) => x.id !== id),
            controls: s.data.controls.map((c) => ({
              ...c,
              linkedRiskIds: c.linkedRiskIds.filter((x) => x !== id),
            })),
            evidence: s.data.evidence.map((e) => ({
              ...e,
              linkedRiskIds: e.linkedRiskIds.filter((x) => x !== id),
            })),
            decisions: s.data.decisions.map((d) => ({
              ...d,
              linkedRiskIds: d.linkedRiskIds.filter((x) => x !== id),
            })),
            incidents: s.data.incidents.map((i) => ({
              ...i,
              relatedRiskIds: i.relatedRiskIds.filter((x) => x !== id),
            })),
          },
          lastSaved: nowISO(),
        })),

      /* ---- controls ---- */
      upsertControl: (c) =>
        set((s) => ({
          data: { ...s.data, controls: upsert(s.data.controls, touch(c)) },
          lastSaved: nowISO(),
        })),
      patchControl: (id, p) =>
        set((s) => ({
          data: { ...s.data, controls: patch(s.data.controls, id, p) },
          lastSaved: nowISO(),
        })),
      removeControl: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            controls: s.data.controls.filter((x) => x.id !== id),
            risks: s.data.risks.map((r) => ({
              ...r,
              linkedControlIds: r.linkedControlIds.filter((x) => x !== id),
            })),
            evidence: s.data.evidence.map((e) => ({
              ...e,
              linkedControlIds: e.linkedControlIds.filter((x) => x !== id),
            })),
            decisions: s.data.decisions.map((d) => ({
              ...d,
              linkedControlIds: d.linkedControlIds.filter((x) => x !== id),
            })),
          },
          lastSaved: nowISO(),
        })),

      /* ---- evidence ---- */
      upsertEvidence: (e) =>
        set((s) => ({
          data: { ...s.data, evidence: upsert(s.data.evidence, touch(e)) },
          lastSaved: nowISO(),
        })),
      patchEvidence: (id, p) =>
        set((s) => ({
          data: { ...s.data, evidence: patch(s.data.evidence, id, p) },
          lastSaved: nowISO(),
        })),
      removeEvidence: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            evidence: s.data.evidence.filter((x) => x.id !== id),
            risks: s.data.risks.map((r) => ({
              ...r,
              linkedEvidenceIds: r.linkedEvidenceIds.filter((x) => x !== id),
            })),
            controls: s.data.controls.map((c) => ({
              ...c,
              linkedEvidenceIds: c.linkedEvidenceIds.filter((x) => x !== id),
            })),
            decisions: s.data.decisions.map((d) => ({
              ...d,
              linkedEvidenceIds: d.linkedEvidenceIds.filter((x) => x !== id),
            })),
          },
          lastSaved: nowISO(),
        })),

      /* ---- decisions ---- */
      upsertDecision: (d) =>
        set((s) => ({
          data: { ...s.data, decisions: upsert(s.data.decisions, touch(d)) },
          lastSaved: nowISO(),
        })),
      patchDecision: (id, p) =>
        set((s) => ({
          data: { ...s.data, decisions: patch(s.data.decisions, id, p) },
          lastSaved: nowISO(),
        })),
      removeDecision: (id) =>
        set((s) => ({
          data: { ...s.data, decisions: s.data.decisions.filter((x) => x.id !== id) },
          lastSaved: nowISO(),
        })),

      /* ---- incidents ---- */
      upsertIncident: (i) =>
        set((s) => ({
          data: { ...s.data, incidents: upsert(s.data.incidents, touch(i)) },
          lastSaved: nowISO(),
        })),
      patchIncident: (id, p) =>
        set((s) => ({
          data: { ...s.data, incidents: patch(s.data.incidents, id, p) },
          lastSaved: nowISO(),
        })),
      removeIncident: (id) =>
        set((s) => ({
          data: { ...s.data, incidents: s.data.incidents.filter((x) => x.id !== id) },
          lastSaved: nowISO(),
        })),

      /* ---- framework notes ---- */
      upsertFrameworkNote: (framework, area, notes) =>
        set((s) => {
          const existing = s.data.frameworkNotes.find(
            (n) => n.framework === framework && n.requirementArea === area
          );
          let frameworkNotes: FrameworkNote[];
          if (existing) {
            frameworkNotes = s.data.frameworkNotes.map((n) =>
              n.id === existing.id ? { ...n, notes, updatedAt: nowISO() } : n
            );
          } else {
            frameworkNotes = [
              ...s.data.frameworkNotes,
              {
                id: newId('fwn'),
                framework,
                requirementArea: area,
                notes,
                updatedAt: nowISO(),
              },
            ];
          }
          return { data: { ...s.data, frameworkNotes }, lastSaved: nowISO() };
        }),

      /* ---- workspace data ops ---- */
      loadSampleData: () => set({ data: sampleWorkspace(), lastSaved: nowISO() }),
      resetSampleData: () => set({ data: sampleWorkspace(), lastSaved: nowISO() }),
      clearAll: () => set({ data: emptyWorkspace(), lastSaved: nowISO() }),

      importData: (incoming) => {
        const data: WorkspaceData =
          'data' in incoming && (incoming as WorkspaceExport).app
            ? (incoming as WorkspaceExport).data
            : (incoming as WorkspaceData);
        // Merge with an empty workspace so missing collections never crash the UI.
        const merged: WorkspaceData = { ...emptyWorkspace(), ...data };
        set({ data: merged, lastSaved: nowISO() });
      },

      exportData: () => ({
        app: 'ai-compliance-workspace',
        version: EXPORT_VERSION,
        exportedAt: nowISO(),
        data: get().data,
      }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ data: s.data, lastSaved: s.lastSaved }),
    }
  )
);
