import * as cheerio from 'cheerio';
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
      this.definitionFileName = definitionRefElement.text();
    } else {
      const definitionElement = xmlDocument('Definition').first();
      if (definitionElement.length > 0) {
        this.player = definitionElement.attr('player');
        this.editor = definitionElement.attr('editor');
        this.definition = definitionElement.text();
      }
    }
    if (!this.definition && !this.definitionFileName) throw new Error('definition and definition file empty');
  }
}
