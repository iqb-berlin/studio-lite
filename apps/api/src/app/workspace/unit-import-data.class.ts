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
  baseVariables: VeronaVariable[] = [];
  codingScheme: string;
  codingSchemeFileName: string;

  constructor(fileIo: FileIo) {
    this.fileName = fileIo.originalname;
    const xmlDocument = cheerio.load(fileIo.buffer.toString());
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
    const definitionRefElement = xmlDocument('DefinitionRef').first();
    this.definition = '';
    this.definitionFileName = '';
    if (definitionRefElement.length > 0) {
      this.player = definitionRefElement.attr('player');
      this.editor = definitionRefElement.attr('editor');
      this.definitionFileName = this.getFolder() + definitionRefElement.text();
    } else {
      const definitionElement = xmlDocument('Definition').first();
      if (definitionElement.length > 0) {
        this.player = definitionElement.attr('player');
        this.editor = definitionElement.attr('editor');
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
