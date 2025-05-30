import * as cheerio from 'cheerio';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { FileIo } from '../interfaces/file-io.interface';

export class UnitImportData {
  key: string;
  name: string;
  fileName: string;
  description: string;
  transcript: string;
  reference: string;
  definition: string;
  definitionFileName: string;
  commentsFileName: string;
  metadata:string;
  metadataFileName:string;
  player: string;
  editor: string;
  schemer: string;
  schemeType: string;
  baseVariables: VariableInfo[] = [];
  codingScheme: string;
  codingSchemeFileName: string;
  lastChangedMetadata: Date;
  lastChangedDefinition: Date;
  lastChangedScheme: Date;
  lastChangedMetadataUser: string;
  lastChangedDefinitionUser: string;
  lastChangedSchemeUser: string;

  constructor(fileIo: FileIo) {
    this.fileName = fileIo.originalname;
    const xmlDocument = cheerio.load(fileIo.buffer.toString(), {
      xmlMode: true,
      recognizeSelfClosing: true
    });
    this.setMetaData(xmlDocument);
    this.setDefinitionRef(xmlDocument);
    this.setCommentsRef(xmlDocument);
    if (this.definition || this.definitionFileName) {
      this.setBaseVariables(xmlDocument);
      this.setCodingSchemeRef(xmlDocument);
    }
  }

  private setCodingSchemeRef(xmlDocument: cheerio.CheerioAPI) {
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

  private setCommentsRef(xmlDocument: cheerio.CheerioAPI): void {
    const commentsRefElement = xmlDocument('UnitCommentsRef').first();
    this.commentsFileName = (commentsRefElement.length > 0) ? this.getFolder() + commentsRefElement.text() : '';
  }

  private setDefinitionRef(xmlDocument: cheerio.CheerioAPI): void {
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
        this.definition = definitionElement.text() || '';
      }
    }
  }

  private setMetaData(xmlDocument: cheerio.CheerioAPI): void {
    const metadataElement = xmlDocument('Metadata').first();
    if (metadataElement.length === 0) throw new Error('metadata element missing');
    const unitIdElement = metadataElement.find('Id').first();
    if (unitIdElement.length === 0) throw new Error('unit id element missing');
    this.key = unitIdElement.text();
    if (this.key.length === 0) throw new Error('unit id missing');
    const unitLabelElement = metadataElement.find('Label').first();
    this.name = unitLabelElement.length > 0 ? unitLabelElement.text() : '';
    const unitMetadataReferenceElement = metadataElement.find('Reference').first();
    this.metadataFileName = unitMetadataReferenceElement.length > 0 ?
      this.getFolder() + unitMetadataReferenceElement.text() : '';
    const unitDescriptionElement = metadataElement.find('Description').first();
    this.description =
      unitDescriptionElement.length > 0 ? unitDescriptionElement.text() : '';
    const unitTranscriptElement = metadataElement.find('Transcript').first();
    this.transcript =
      unitTranscriptElement.length > 0 ? unitTranscriptElement.text() : '';
    const unitReferenceElement = metadataElement.find('Reference').first();
    this.reference =
      unitReferenceElement.length > 0 ? unitReferenceElement.text() : '';
    const unitLastChangeElement = metadataElement.find('Lastchange').first();
    if (unitLastChangeElement.length > 0) {
      this.lastChangedMetadata = new Date(unitLastChangeElement.text());
      this.lastChangedDefinition = new Date(unitLastChangeElement.text());
      this.lastChangedScheme = new Date(unitLastChangeElement.text());
    }
    const lastChangedMetadata = metadataElement.attr('lastchange');
    if (lastChangedMetadata) this.lastChangedMetadata = new Date(lastChangedMetadata);
  }

  private setBaseVariables(xmlDocument: cheerio.CheerioAPI): void {
    const baseVariablesElement = xmlDocument('BaseVariables').first();
    if (baseVariablesElement.length > 0) {
      baseVariablesElement.find('Variable')
        .each((i, variableElement) => {
          const varDocument = cheerio.load(variableElement, {
            xmlMode: true,
            recognizeSelfClosing: true
          });
          const variableRecord = variableElement as unknown as Record<string, unknown>;
          const valuesElement = varDocument('Values').first();
          const valuePositionLabelsElement = varDocument('ValuePositionLabels').first();
          this.baseVariables.push({
            // eslint-disable-next-line @typescript-eslint/dot-notation
            id: variableRecord.attribs['id'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            alias: variableRecord.attribs['alias'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            type: variableRecord.attribs['type'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            format: variableRecord.attribs['format'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            nullable: variableRecord.attribs['nullable'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            multiple: variableRecord.attribs['multiple'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            page: variableRecord.attribs['page'],
            // eslint-disable-next-line @typescript-eslint/dot-notation
            valuePositionLabels: UnitImportData.getValuePositionLabelsForVariable(valuePositionLabelsElement),
            valuesComplete: valuesElement.length ? valuesElement.attr('complete') as unknown as boolean : false,
            values: UnitImportData.getValuesForVariable(valuesElement)
          });
        });
    }
  }

  private static getValuesForVariable(
    valuesElement: cheerio.Cheerio<cheerio.Element>
  ):{ label: string, value: string }[] {
    const values: { label: string, value: string }[] = [];
    valuesElement.find('Value')
      .each((j, valueElement) => {
        const valueDocument = cheerio.load(valueElement, {
          xmlMode: true,
          recognizeSelfClosing: true
        });
        values.push({
          label: valueDocument('label').first().text(),
          value: valueDocument('value').first().text()
        });
      });
    return values;
  }

  private static getValuePositionLabelsForVariable(
    valuePositionLabelsElement: cheerio.Cheerio<cheerio.Element>
  ): string[] {
    const values: string[] = [];
    valuePositionLabelsElement.find('ValuePositionLabel')
      .each((j, element) => {
        const valueDocument = cheerio.load(element, {
          xmlMode: true,
          recognizeSelfClosing: true
        });
        values.push(valueDocument.text());
      });
    return values;
  }

  private getFolder(): string {
    const regexPattern = /^(.+)\/.+$/;
    const folderMatch = regexPattern.exec(this.fileName);
    if (folderMatch && folderMatch.length === 2) return `${folderMatch[1]}/`;
    return '';
  }
}
