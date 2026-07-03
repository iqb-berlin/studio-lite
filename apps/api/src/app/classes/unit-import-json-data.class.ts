import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitFullMetadataDto } from '@studio-lite-lib/api-dto';
import { FileIo } from '../interfaces/file-io.interface';

interface ExternalDataBlock {
  id: string;
  type: string;
  modifiedAt?: string;
}

interface UnitIndexJson {
  id: string;
  uuid?: string;
  modifiedAt?: string;
  label?: string;
  description?: string;
  userInterface: {
    player: string;
    editor?: string;
    definition?: string;
    isDefinitionInline?: boolean;
    modifiedAt?: string;
  };
  codingScheme?: ExternalDataBlock;
  comments?: ExternalDataBlock;
  richNotes?: ExternalDataBlock;
  metadata?: ExternalDataBlock;
  items?: ExternalDataBlock;
  variables?: ExternalDataBlock;
}

export class UnitImportJsonData {
  key: string;
  name: string;
  fileName: string;
  description: string;
  transcript = '';
  reference = '';
  definition = '';
  definitionFileName: string;
  commentsFileName: string;
  richNotesFileName: string;
  metadata: UnitFullMetadataDto;
  metadataFileName: string;
  itemsFileName: string;
  player: string;
  editor: string;
  schemer = '';
  schemeType = '';
  baseVariables: VariableInfo[] = [];
  codingScheme = '';
  codingSchemeFileName: string;
  variablesFileName: string;
  lastChangedMetadata: Date;
  lastChangedDefinition: Date;
  lastChangedScheme: Date;
  lastChangedMetadataUser = '';
  lastChangedDefinitionUser = '';
  lastChangedSchemeUser = '';

  constructor(fileIo: FileIo) {
    this.fileName = fileIo.originalname;
    const folder = this.getFolder();
    const index: UnitIndexJson = JSON.parse(fileIo.buffer.toString());
    if (!index.id) throw new Error('unit id missing');
    if (!index.userInterface) throw new Error('userInterface missing');

    this.key = index.id;
    this.name = index.label ?? '';
    this.description = index.description ?? '';
    this.player = index.userInterface.player ?? '';
    this.editor = index.userInterface.editor ?? '';
    this.definitionFileName = index.userInterface.definition ? folder + index.userInterface.definition : '';
    this.commentsFileName = index.comments?.id ? folder + index.comments.id : '';
    this.richNotesFileName = index.richNotes?.id ? folder + index.richNotes.id : '';
    this.metadataFileName = index.metadata?.id ? folder + index.metadata.id : '';
    this.itemsFileName = index.items?.id ? folder + index.items.id : '';
    this.codingSchemeFileName = index.codingScheme?.id ? folder + index.codingScheme.id : '';
    this.variablesFileName = index.variables?.id ? folder + index.variables.id : '';

    if (index.modifiedAt) this.lastChangedMetadata = new Date(index.modifiedAt);
    if (index.userInterface.modifiedAt) this.lastChangedDefinition = new Date(index.userInterface.modifiedAt);
    if (index.codingScheme?.modifiedAt) this.lastChangedScheme = new Date(index.codingScheme.modifiedAt);
  }

  private getFolder(): string {
    const regexPattern = /^(.+)\/.+$/;
    const folderMatch = regexPattern.exec(this.fileName);
    if (folderMatch && folderMatch.length === 2) return `${folderMatch[1]}/`;
    return '';
  }
}
