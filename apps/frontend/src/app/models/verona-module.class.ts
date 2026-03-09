import { VeronaModuleInListDto, VeronaModuleMetadataDto, VeronaModuleType } from '@studio-lite-lib/api-dto';

export class VeronaModuleClass {
  key: string;
  sortKey: string;
  metadata: VeronaModuleMetadataDto;
  fileSize: number;
  fileDateTime: number;
  html = '';

  get nameAndVersion(): string {
    return `${this.metadata.name} ${this.metadata.version}`;
  }

  constructor(moduleData: VeronaModuleInListDto) {
    this.key = moduleData.key;
    this.sortKey = moduleData.sortKey;
    this.metadata = moduleData.metadata;
    this.fileSize = moduleData.fileSize || 0;
    this.fileDateTime = moduleData.fileDateTime || 0;
  }
}

export interface FlattenedVeronaModuleClass {
  key: string;
  sortKey: string;
  fileSize: number;
  fileDateTime: number;
  html: string;
  id: string;
  type: VeronaModuleType;
  model: string;
  name: string;
  version: string;
  specVersion: string;
  isStable: boolean;
}
