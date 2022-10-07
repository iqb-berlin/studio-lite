import * as cheerio from 'cheerio';
import { VeronaVariable } from '@studio-lite/shared-code';
import { FileIo } from '../interfaces/file-io.interface';

export class UnitImportData {
  key: string;
  name: string;
  fileName: string;
  description: string;
  definition: string;
  definitionFileName: string;
  player: string;
  editor: string;
  schemer: string;
  schemeType: string;
  baseVariables: VeronaVariable[] = [];
  codingScheme: string;
  codingSchemeFileName: string;
  lastChangedMetadata: Date;
  lastChangedDefinition: Date;
  lastChangedScheme: Date;

  constructor(fileIo: FileIo) {
    this.fileName = fileIo.originalname;
    const xmlDocument = cheerio.load(fileIo.buffer.toString(), {
      xmlMode: true,
      recognizeSelfClosing: true
    });
    const metadataElement = xmlDocument('Metadata').first();
    if (metadataElement.length === 0) throw new Error('metadata element missing');
    const unitIdElement = metadataElement.find('Id').first();
    if (unitIdElement.length === 0) throw new Error('unit id element missing');
    this.key = unitIdElement.text();
    if (this.key.length === 0) throw new Error('unit id missing');
    const unitLabelElement = metadataElement.find('Label').first();
    this.name = unitLabelElement.length > 0 ? unitLabelElement.text() : '';
    const unitDescriptionElement = metadataElement.find('Description').first();
    this.description = unitDescriptionElement.length > 0 ? unitDescriptionElement.text() : '';
    const unitLastChangeElement = metadataElement.find('Lastchange').first();
    if (unitLastChangeElement.length > 0) {
      this.lastChangedMetadata = new Date(unitLastChangeElement.text());
      this.lastChangedDefinition = new Date(unitLastChangeElement.text());
      this.lastChangedScheme = new Date(unitLastChangeElement.text());
    }
    const lastChangedMetadata = metadataElement.attr('lastchange');
    if (lastChangedMetadata) this.lastChangedMetadata = new Date(lastChangedMetadata);

    const definitionRefElement = xmlDocument('DefinitionRef').first();
    this.definition = '';
    this.definitionFileName = '';
    if (definitionRefElement.length > 0) {
      this.player = definitionRefElement.attr('player');
      this.editor = definitionRefElement.attr('editor');
      const lastChangedDefinition = definitionRefElement.attr('lastchange');
      if (lastChangedDefinition) this.lastChangedDefinition = new Date(lastChangedDefinition);
      this.definitionFileName = this.getFolder() + definitionRefElement.text();
    } else {
      const definitionElement = xmlDocument('Definition').first();
      if (definitionElement.length > 0) {
        this.player = definitionElement.attr('player');
        this.editor = definitionElement.attr('editor');
        const lastChangedDefinition = definitionElement.attr('lastchange');
        if (lastChangedDefinition) this.lastChangedDefinition = new Date(lastChangedDefinition);
        this.definition = definitionElement.text();
      }
    }
    if (!this.definition && !this.definitionFileName) throw new Error('definition and definition file empty');
    const baseVariablesElement = xmlDocument('BaseVariables').first();
    if (baseVariablesElement.length > 0) {
      baseVariablesElement.find('Variable').each((i, varElement) => {
        const valuesElement = baseVariablesElement.find('Values').first();
        this.baseVariables.push(new VeronaVariable({
          id: varElement.attribs['id'],
          type: varElement.attribs['type'],
          format: varElement.attribs['format'],
          nullable: varElement.attribs['nullable'],
          multiple: varElement.attribs['multiple'],
          valuesComplete: valuesElement.length > 0 ? valuesElement.attr['complete'] : false,
          values: valuesElement.length > 0 ?
            valuesElement.children['Value'].map(varValueElement => varValueElement.text()) : []
        }));
      });
    }
    this.codingSchemeFileName = '';
    this.schemer = '';
    const codingSchemeElement = xmlDocument('CodingSchemeRef').first();
    if (codingSchemeElement.length > 0) {
      this.schemer = codingSchemeElement.attr('schemer');
      this.schemeType = codingSchemeElement.attr('schemetype');
      const lastChangedScheme = codingSchemeElement.attr('lastchange');
      if (lastChangedScheme) this.lastChangedScheme = new Date(lastChangedScheme);
      this.codingSchemeFileName = this.getFolder() + codingSchemeElement.text();
    }
  }

  private getFolder(): string {
    const regexPattern = /^(.+)\/.+$/;
    const folderMatch = regexPattern.exec(this.fileName);
    if (folderMatch && folderMatch.length === 2) return `${folderMatch[1]}/`;
    return '';
  }
}
