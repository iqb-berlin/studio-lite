import { VeronaModuleClass } from '../../shared/models/verona-module.class';

export interface ModuleSelectionChange {
  type: string;
  selectedModules: VeronaModuleClass[];
}
