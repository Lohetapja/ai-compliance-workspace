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
    frameworkNotes: [],
    organizationName: 'Northstar AI Cloud',
  };
}
