import { VeronaModuleClass } from '../../../models/verona-module.class';

export interface ModuleSelectionChange {
  type: string;
  selectedModules: VeronaModuleClass[];
}
