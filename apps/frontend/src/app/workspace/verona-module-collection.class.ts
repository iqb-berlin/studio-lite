import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';

export class VeronaModuleCollection extends VeronaModuleKeyCollection {
  moduleData: { [key: string]: VeronaModuleInListDto };
  constructor(modules: VeronaModuleInListDto[]) {
    super(modules.map(m => m.key));
    this.moduleData = {};
    modules.forEach(m => {
      this.moduleData[m.key] = m;
    });
  }

  getName(key: string): string {
    const dataEntry = this.moduleData[key];
    if (dataEntry) {
      return dataEntry.metadata.name;
    }
    return '?';
  }

  getEntries(): VeronaModuleInListDto[] {
    return this.getSorted().map(key => this.moduleData[key]);
  }
}
