import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { FileIo } from '../interfaces/file-io.interface';
import { UnitIndexJson } from '../interfaces/unit-json-specs.interface';

export class UnitImportJsonData {
  key: string;
  name: string;
  uuid: string;
  fileName: string;
  description: string;
  transcript = '';
  reference = '';
  definition = '';
  definitionFileName: string;
  commentsFileName: string;
  richNotesFileName: string;
  metadata: UnitMetadataValues;
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
    this.uuid = index.uuid ?? '';
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
    const lastSlash = this.fileName.lastIndexOf('/');
    if (lastSlash > 0 && lastSlash < this.fileName.length - 1) return this.fileName.substring(0, lastSlash + 1);
    return '';
  }
}
