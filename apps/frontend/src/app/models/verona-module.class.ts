import { VeronaModuleInListDto, VeronaModuleMetadataDto, VeronaModuleType } from '@studio-lite-lib/api-dto';

/**
 * An installed Verona module as the frontend holds it: what the API listed about it, plus its HTML
 * once it has been fetched -- a module is only loaded when it is actually opened.
 */
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

/**
 * The same module with its metadata pulled up to the top level, for the table that shows one field
 * per column and cannot reach into a nested object.
 */
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
