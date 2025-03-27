import { State } from '../../admin/models/state.type';

export interface WorkspaceSettings {
  defaultEditor: string;
  defaultPlayer: string;
  defaultSchemer: string;
  unitGroups?: string[];
  stableModulesOnly?: boolean;
  unitMDProfile?: string;
  itemMDProfile?: string;
  states?: State[];
}
