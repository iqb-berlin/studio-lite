import {
  UnitExportConfigDto, UnitPropertiesDto, UnitDefinitionDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { UnitXmlDownloadClass } from './unit-xml-download.class';

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
});
