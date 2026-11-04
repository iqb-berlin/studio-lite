import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import { createMock } from '@golevelup/ts-jest';
import {
  UnitCommentDto, UnitExportConfigDto, UnitPropertiesDto, UnitDefinitionDto, UnitRichNoteDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { UnitXmlDownloadClass } from './unit-xml-download.class';
import type { UnitRichNoteService } from '../services/unit-rich-note.service';

describe('UnitXmlDownloadClass', () => {
  describe('createUnitXML', () => {
    it('should generate valid XML structure', () => {
      const exportConfig = {
        unitXsdUrl: 'xsd'
      } as unknown as UnitExportConfigDto;
      const metadata = {
        key: 'K1',
        name: 'N1',
        description: 'D1',
        lastChangedMetadata: new Date('2023-01-01'),
        metadata: {}
      } as unknown as UnitPropertiesDto;

      const unitDownloadClass = UnitXmlDownloadClass as unknown as {
        createUnitXML: (
          config: UnitExportConfigDto,
          meta: UnitPropertiesDto
        ) => { toString: () => string };
      };
      const xml = unitDownloadClass.createUnitXML(exportConfig, metadata);
      const xmlString = xml.toString();

      expect(xmlString).toContain('K1');
      expect(xmlString).toContain('N1');
      expect(xmlString).toContain('D1');
    });
  });

  // coding-box, the testcenter and the unit XSD know only the VariableInfo 1.x spelling (#1708)
  describe('addVariables', () => {
    const unitDownloadClass = UnitXmlDownloadClass as unknown as {
      createUnitXML: (
        config: UnitExportConfigDto,
        meta: UnitPropertiesDto
      ) => { toString: () => string };
    };

    it('should write a list stored in 2.x in the 1.x spelling, with the page', () => {
      const unitXml = unitDownloadClass.createUnitXML(
        { unitXsdUrl: 'xsd' } as unknown as UnitExportConfigDto,
        { key: 'K1', name: 'N1', metadata: {} } as unknown as UnitPropertiesDto
      );
      const variable = (id: string, type: string, format: string) => ({
        id, type, format, multiple: false, nullable: false, values: [], valuePositionLabels: []
      });
      const storedIn2x = [
        variable('v1', 'NO_VALUE', ''),
        variable('v2', 'STRING', 'GGB_FILE')
      ] as unknown as UnitDefinitionDto['variables'];

      UnitXmlDownloadClass.addVariables(
        { variables: storedIn2x } as UnitDefinitionDto,
        unitXml as unknown as Parameters<typeof UnitXmlDownloadClass.addVariables>[1]
      );

      const xmlString = unitXml.toString();
      const flags = 'nullable="false" multiple="false" page=""';
      expect(xmlString).toContain(`<Variable id="v1" type="no-value" format="" ${flags}/>`);
      expect(xmlString).toContain(`<Variable id="v2" type="string" format="ggb-file" ${flags}/>`);
    });

    it('should write a format that 1.x does not know as 1.x would, for the unit XSD (#1857)', () => {
      const unitXml = unitDownloadClass.createUnitXML(
        { unitXsdUrl: 'xsd' } as unknown as UnitExportConfigDto,
        { key: 'K1', name: 'N1', metadata: {} } as unknown as UnitPropertiesDto
      );
      const variable = (id: string, type: string, format: string) => ({
        id, type, format, multiple: false, nullable: false, values: [], valuePositionLabels: []
      });
      const chemistry = [
        variable('periodic_1', 'STRING', 'CHEM_ELEMENT_SYMBOLS'),
        variable('molecule_1', 'JSON', 'CHEM_MOLECULE')
      ] as unknown as UnitDefinitionDto['variables'];

      UnitXmlDownloadClass.addVariables(
        { variables: chemistry } as UnitDefinitionDto,
        unitXml as unknown as Parameters<typeof UnitXmlDownloadClass.addVariables>[1]
      );

      const xmlString = unitXml.toString();
      const flags = 'nullable="false" multiple="false" page=""';
      expect(xmlString).toContain(`<Variable id="periodic_1" type="string" format="chem-element-symbols" ${flags}/>`);
      expect(xmlString).toContain(`<Variable id="molecule_1" type="json" format="chem-molecule" ${flags}/>`);
    });
  });

  describe('addDerivedVariables', () => {
    const unitDownloadClass = UnitXmlDownloadClass as unknown as {
      createUnitXML: (
        config: UnitExportConfigDto,
        meta: UnitPropertiesDto
      ) => { toString: () => string };
      addDerivedVariables: (
        schemeData: UnitSchemeDto,
        unitXml: { toString: () => string }
      ) => void;
    };

    it('should add DerivedVariables from coding scheme', () => {
      const exportConfig = {
        unitXsdUrl: 'xsd'
      } as unknown as UnitExportConfigDto;
      const metadata = {
        key: 'K1',
        name: 'N1',
        description: 'D1',
        lastChangedMetadata: new Date('2023-01-01'),
        metadata: {}
      } as unknown as UnitPropertiesDto;
      const unitXml = unitDownloadClass.createUnitXML(exportConfig, metadata);

      const schemeData = {
        scheme: JSON.stringify({
          version: '3.3',
          variableCodings: [
            { id: 'base1', sourceType: 'BASE', alias: 'base1_alias' },
            {
              id: 'derived1',
              sourceType: 'SUM_CODE',
              alias: 'derived1_alias',
              page: 'page1'
            },
            {
              id: 'derived2',
              sourceType: 'CONCAT_CODE',
              alias: 'derived2_alias'
            },
            { id: 'derived3', sourceType: 'SUM_SCORE' },
            { id: 'derived4', sourceType: 'SOLVER', alias: 'solver_alias' }
          ]
        }),
        schemeType: 'test'
      } as unknown as UnitSchemeDto;

      unitDownloadClass.addDerivedVariables(schemeData, unitXml);
      const xmlString = unitXml.toString();

      expect(xmlString).toContain('<DerivedVariables>');
      expect(xmlString).toContain('derived1_alias');
      expect(xmlString).toContain('derived2_alias');
      expect(xmlString).toContain('derived3');
      expect(xmlString).toContain('solver_alias');
      expect(xmlString).not.toContain('base1_alias');
    });

    it('should not add DerivedVariables if scheme is empty', () => {
      const exportConfig = {
        unitXsdUrl: 'xsd'
      } as unknown as UnitExportConfigDto;
      const metadata = {
        key: 'K1',
        name: 'N1',
        description: 'D1',
        lastChangedMetadata: new Date('2023-01-01'),
        metadata: {}
      } as unknown as UnitPropertiesDto;
      const unitXml = unitDownloadClass.createUnitXML(exportConfig, metadata);

      const schemeData = {
        scheme: '',
        schemeType: ''
      } as unknown as UnitSchemeDto;
      unitDownloadClass.addDerivedVariables(schemeData, unitXml);
      const xmlString = unitXml.toString();

      expect(xmlString).not.toContain('DerivedVariables');
    });

    it('should not add DerivedVariables if only base variables exist', () => {
      const exportConfig = {
        unitXsdUrl: 'xsd'
      } as unknown as UnitExportConfigDto;
      const metadata = {
        key: 'K1',
        name: 'N1',
        description: 'D1',
        lastChangedMetadata: new Date('2023-01-01'),
        metadata: {}
      } as unknown as UnitPropertiesDto;
      const unitXml = unitDownloadClass.createUnitXML(exportConfig, metadata);

      const schemeData = {
        scheme: JSON.stringify({
          version: '3.3',
          variableCodings: [
            { id: 'base1', sourceType: 'BASE' },
            { id: 'base2', sourceType: 'BASE_NO_VALUE' }
          ]
        }),
        schemeType: 'test'
      } as unknown as UnitSchemeDto;

      unitDownloadClass.addDerivedVariables(schemeData, unitXml);
      const xmlString = unitXml.toString();

      expect(xmlString).not.toContain('DerivedVariables');
    });

    it('should set correct type based on sourceType', () => {
      const exportConfig = {
        unitXsdUrl: 'xsd'
      } as unknown as UnitExportConfigDto;
      const metadata = {
        key: 'K1',
        name: 'N1',
        description: 'D1',
        lastChangedMetadata: new Date('2023-01-01'),
        metadata: {}
      } as unknown as UnitPropertiesDto;
      const unitXml = unitDownloadClass.createUnitXML(exportConfig, metadata);

      const schemeData = {
        scheme: JSON.stringify({
          version: '3.3',
          variableCodings: [
            { id: 'sum_code_var', sourceType: 'SUM_CODE', alias: 'sc' },
            { id: 'sum_score_var', sourceType: 'SUM_SCORE', alias: 'ss' },
            { id: 'copy_value_var', sourceType: 'COPY_VALUE', alias: 'cv' },
            { id: 'solver_var', sourceType: 'SOLVER', alias: 'sv' },
            { id: 'concat_var', sourceType: 'CONCAT_CODE', alias: 'cc' },
            {
              id: 'unique_values_var',
              sourceType: 'UNIQUE_VALUES',
              alias: 'uv'
            },
            { id: 'manual_var', sourceType: 'MANUAL', alias: 'mv' }
          ]
        }),
        schemeType: 'test'
      } as unknown as UnitSchemeDto;

      unitDownloadClass.addDerivedVariables(schemeData, unitXml);
      const xmlString = unitXml.toString();

      expect(xmlString).toContain('id="sc" type="integer"');
      expect(xmlString).toContain('id="ss" type="integer"');
      expect(xmlString).toContain('id="cv" type="integer"');
      expect(xmlString).toContain('id="sv" type="number"');
      expect(xmlString).toContain('id="cc" type="string"');
      expect(xmlString).toContain('id="uv" type="boolean"');
      expect(xmlString).toContain('id="mv" type="string"');
    });
  });

  // What the unit XML refers to and which files go into the zip beside it.
  describe('the unit and its files', () => {
    const changed = new Date('2024-01-02T03:04:05.000Z');
    const unit = { key: 'K1', name: 'N1', metadata: {} } as unknown as UnitPropertiesDto;
    let unitXml: ReturnType<typeof UnitXmlDownloadClass.createUnitXML>;
    let zip: AdmZip;
    const files = () => zip.getEntries().map(entry => entry.entryName);

    beforeEach(() => {
      unitXml = UnitXmlDownloadClass.createUnitXML({ unitXsdUrl: 'xsd' } as UnitExportConfigDto, unit);
      zip = new AdmZip();
    });

    it('should describe a unit without definition in its XML, with no definition file', () => {
      UnitXmlDownloadClass.addUnitDefinition(
        { definition: '' } as UnitDefinitionDto, unitXml, { ...unit, player: 'P', lastChangedDefinition: changed }, zip
      );

      expect(unitXml.toString()).toContain(`<Definition player="P" editor="" lastChange="${changed.toISOString()}"/>`);
      expect(files()).toEqual([]);
    });

    it('should date the definition file the unit refers to', () => {
      UnitXmlDownloadClass.addUnitDefinition(
        { definition: '{}' } as UnitDefinitionDto,
        unitXml,
        { ...unit, editor: 'E', lastChangedDefinition: changed },
        zip
      );

      expect(unitXml.toString())
        .toContain(`<DefinitionRef player="" editor="E" lastChange="${changed.toISOString()}">K1.voud</DefinitionRef>`);
      expect(files()).toEqual(['K1.voud']);
    });

    // A spelling of schemeType went wrong before (#1759).
    it('should name schemer, scheme type and date on the reference to the scheme file', () => {
      UnitXmlDownloadClass.addScheme(
        { scheme: '{}' } as UnitSchemeDto,
        unitXml,
        {
          ...unit, schemer: 'iqb-schemer@2.0', schemeType: 'iqb-standard@3.0', lastChangedScheme: changed
        },
        zip
      );

      const $ = load(unitXml.toString(), { xml: true });
      expect($('CodingSchemeRef').attr()).toEqual({
        schemer: 'iqb-schemer@2.0', schemeType: 'iqb-standard@3.0', lastChange: changed.toISOString()
      });
      expect($('CodingSchemeRef').text()).toBe('K1.vocs');
      expect(files()).toEqual(['K1.vocs']);
    });

    // A unit from a JSON import has no schemer; without the reference a new import lost the scheme (#1990).
    it('should refer to the scheme file of a unit without a schemer, with an empty schemer', () => {
      UnitXmlDownloadClass.addScheme({ scheme: '{}' } as UnitSchemeDto, unitXml, { ...unit, schemer: '' }, zip);

      const $ = load(unitXml.toString(), { xml: true });
      expect($('CodingSchemeRef').attr()).toEqual({ schemer: '' });
      expect($('CodingSchemeRef').text()).toBe('K1.vocs');
      expect(files()).toEqual(['K1.vocs']);
    });

    it('should leave out the reference of a unit with neither scheme nor schemer', () => {
      UnitXmlDownloadClass.addScheme({ scheme: '' } as UnitSchemeDto, unitXml, { ...unit, schemer: '' }, zip);

      expect(load(unitXml.toString(), { xml: true })('CodingSchemeRef')).toHaveLength(0);
      expect(files()).toEqual([]);
    });

    it('should write the values of a variable and the labels of their positions', () => {
      UnitXmlDownloadClass.addVariables({
        variables: [{
          id: 'v1',
          type: 'string',
          format: '',
          multiple: false,
          nullable: false,
          page: '',
          values: [{ label: 'Ja', value: '1' }],
          valuePositionLabels: ['erste'],
          valuesComplete: true
        }]
      } as unknown as UnitDefinitionDto, unitXml);

      const $ = load(unitXml.toString(), { xml: true });
      expect($('ValuePositionLabels > ValuePositionLabel').toArray().map(label => $(label).text())).toEqual(['erste']);
      expect($('Values').attr('complete')).toBe('true');
      expect($('Values > Value').toArray().map(value => ({
        label: $(value).children('label').text(), value: $(value).children('value').text()
      }))).toEqual([{ label: 'Ja', value: '1' }]);
    });

    const reference = (element: string) => load(unitXml.toString(), { xml: true })(element).text();

    it.each([
      ['put the comments into a file the unit refers to', [{ id: 1, body: 'b' }], 'K1.vouc'],
      ['write no comments file for a unit without comments', [], '']
    ])('should %s', (_, comments, file) => {
      UnitXmlDownloadClass.addComments(comments as UnitCommentDto[], unitXml, unit, zip);

      expect(files()).toEqual(file ? [file] : []);
      expect(reference('UnitCommentsRef')).toBe(file);
    });

    it.each([
      ['put the notes into a file the unit refers to', [{ id: 1, tagId: 't', content: 'c' }], 'K1.vorn'],
      ['write no notes file for a unit without notes', [], '']
    ])('should %s', async (_, notes, file) => {
      const unitRichNoteService = createMock<UnitRichNoteService>();
      unitRichNoteService.findNotes.mockResolvedValue({ notes: notes as UnitRichNoteDto[], tags: [] });

      await UnitXmlDownloadClass.addRichNotes(unitRichNoteService, 1, unitXml, unit, zip);

      expect(files()).toEqual(file ? [file] : []);
      expect(reference('UnitRichNotesRef')).toBe(file);
    });
  });
});
