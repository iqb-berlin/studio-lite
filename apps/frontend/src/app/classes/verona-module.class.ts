import { VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';

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

  constructor(modulData: VeronaModuleInListDto) {
    this.key = modulData.key;
    this.sortKey = modulData.sortKey;
    this.metadata = modulData.metadata;
    this.fileSize = modulData.fileSize || 0;
    this.fileDateTime = modulData.fileDateTime || 0;
  }
}
