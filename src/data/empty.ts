import type { WorkspaceData } from '../types';

export function emptyWorkspace(): WorkspaceData {
  return {
    systems: [],
    risks: [],
    controls: [],
    evidence: [],
    decisions: [],
    incidents: [],
    frameworkNotes: [],
    organizationName: 'Northstar AI Cloud',
  };
}
