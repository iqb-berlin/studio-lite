import { createMock } from '@golevelup/ts-jest';
import {
  UnitDownloadSettingsDto,
  UnitExportConfigDto,
  UnitPropertiesDto,
  UnitDefinitionDto,
  UnitSchemeDto,
  VeronaModuleInListDto,
  VeronaModuleFileDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import { UnitDownloadClass } from './unit-download.class';
import { UnitService } from '../services/unit.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';

jest.mock('adm-zip');

describe('UnitDownloadClass', () => {
  let mockZip: {
    addFile: jest.Mock;
    toBuffer: jest.Mock;
  };

  beforeEach(() => {
    mockZip = {
      addFile: jest.fn(),
      toBuffer: jest.fn().mockReturnValue(Buffer.from('zip-content'))
    };
    (AdmZip as unknown as jest.Mock).mockImplementation(() => mockZip);
  });

  describe('get', () => {
    it('should create a zip with unit data and players', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({
        unitXsdUrl: 'unit.xsd',
        bookletXsdUrl: 'booklet.xsd',
        testTakersXsdUrl: 'testtakers.xsd'
      } as unknown as UnitExportConfigDto);

      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U1',
        name: 'Unit 1',
        description: 'Desc',
        metadata: {},
        player: 'player-1',
        lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);

      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: 'def'
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: 'scheme'
      } as unknown as UnitSchemeDto);
      veronaModuleServiceMock.findAll.mockResolvedValue([
        { key: 'player-1' }
      ] as unknown as VeronaModuleInListDto[]);
      veronaModuleServiceMock.findFileById.mockResolvedValue({
        fileName: 'player.html',
        file: Buffer.from('player')
      } as unknown as VeronaModuleFileDto);

      const downloadSettings = {
        unitIdList: [1],
        addPlayers: true,
        addComments: false,
        addTestTakersHot: 0,
        addTestTakersMonitor: 0,
        addTestTakersReview: 0
      } as unknown as UnitDownloadSettingsDto;

      const result = await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        downloadSettings
      );

      expect(result).toEqual(Buffer.from('zip-content'));
      expect(mockZip.addFile).toHaveBeenCalled();
    });
  });

  describe('generateCodeList', () => {
    it('should generate requested number of unique codes', () => {
      const result = UnitDownloadClass.generateCodeList(5, 10);
      expect(result).toHaveLength(10);
      const uniqueCodes = new Set(result);
      expect(uniqueCodes.size).toBe(10);
    });
  });

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

      const unitDownloadClass = UnitDownloadClass as unknown as {
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

  describe('addDerivedVariables', () => {
    const unitDownloadClass = UnitDownloadClass as unknown as {
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
