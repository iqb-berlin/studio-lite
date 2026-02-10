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
      const exportConfig = { unitXsdUrl: 'xsd' } as unknown as UnitExportConfigDto;
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
        ) => { toString: () => string }
      };
      const xml = unitDownloadClass.createUnitXML(exportConfig, metadata);
      const xmlString = xml.toString();

      expect(xmlString).toContain('K1');
      expect(xmlString).toContain('N1');
      expect(xmlString).toContain('D1');
    });
  });
});
