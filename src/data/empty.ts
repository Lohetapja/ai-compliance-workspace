import type { WorkspaceData } from '../types';

export function emptyWorkspace(): WorkspaceData {
  return {
    systems: [],
    risks: [],
    controls: [],
    evidence: [],
    decisions: [],
    incidents: [],
    gapActions: [],
    useCases: [],
    vendors: [],
    frameworkNotes: [],
    organizationName: 'Fictional AI Test Company',
  };
}
