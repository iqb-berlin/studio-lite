import { createMock } from '@golevelup/ts-jest';
import {
  UnitCommentDto,
  UnitDownloadSettingsDto,
  UnitExportConfigDto,
  UnitPropertiesDto,
  UnitDefinitionDto,
  UnitRichNoteDto,
  UnitRichNotesDto,
  UnitSchemeDto,
  VeronaModuleInListDto,
  VeronaModuleFileDto,
  UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import { UnitDownloadClass } from './unit-download.class';
import { UnitService } from '../services/unit.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';

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
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({
        unitXsdUrl: 'unit.xsd',
        bookletXsdUrl: 'booklet.xsd',
        testTakersXsdUrl: 'testtakers.xsd'
      } as unknown as UnitExportConfigDto);

      unitRichNoteServiceMock.findNotes.mockResolvedValue({
        tags: [],
        notes: []
      });

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
        unitRichNoteServiceMock,
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

  describe('findTag and getLabelString', () => {
    const unitDownloadClass = UnitDownloadClass as unknown as {
      findTag: (tags: UnitRichNoteTagDto[], id: string) => UnitRichNoteTagDto;
      getLabelString: (label: { lang: string; value: string }[] | null) => string | null;
    };
    const tags = [
      {
        id: 't1',
        label: [{ lang: 'de', value: 'Label 1' }],
        children: [
          {
            id: 'c1',
            label: [{ lang: 'de', value: 'Label 1.1' }]
          }
        ]
      },
      {
        id: 'https://example.com/vocab/t2',
        label: [{ lang: 'de', value: 'Label 2' }]
      }
    ];

    it('should find tag by exact ID recursively', () => {
      const tag = unitDownloadClass.findTag(tags, 'c1');
      expect(tag.id).toBe('c1');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 1.1');
    });

    it('should find tag by URL ID', () => {
      const tag = unitDownloadClass.findTag(tags, 'https://example.com/vocab/t2');
      expect(tag.id).toBe('https://example.com/vocab/t2');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 2');
    });

    it('should find tag by legacy dot-separated path', () => {
      const tag = unitDownloadClass.findTag(tags, 't1.c1');
      expect(tag.id).toBe('c1');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 1.1');
    });

    it('should return null if tagId is not found', () => {
      const tag = unitDownloadClass.findTag(tags, 'nonexistent');
      expect(tag).toBeNull();
    });

    it('should return null if tagId is empty', () => {
      const tag = unitDownloadClass.findTag(tags, '');
      expect(tag).toBeNull();
    });

    it('should handle missing labels in getLabelString', () => {
      expect(unitDownloadClass.getLabelString(null)).toBeNull();
      expect(unitDownloadClass.getLabelString([])).toBeNull();
    });
  });

  describe('get with exportFormat json', () => {
    it('should create key.json index file and not key.xml', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

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
        lastChangedMetadata: new Date('2025-01-01')
      } as unknown as UnitPropertiesDto);

      unitServiceMock.ensureUuid.mockResolvedValue('test-uuid-1234');

      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>',
        variables: []
      } as unknown as UnitDefinitionDto);

      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '',
        schemeType: ''
      } as unknown as UnitSchemeDto);

      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });

      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      const downloadSettings = {
        unitIdList: [1],
        exportFormat: 'json',
        addPlayers: false,
        addComments: false,
        addRichNotes: false,
        addTestTakersHot: 0,
        addTestTakersMonitor: 0,
        addTestTakersReview: 0
      } as unknown as UnitDownloadSettingsDto;

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        downloadSettings,
        'json'
      );

      const addedFiles = mockZip.addFile.mock.calls.map((c: string[]) => c[0]);
      expect(addedFiles).toContain('U1.json');
      expect(addedFiles).not.toContain('U1.xml');
    });

    it('should embed uuid and modifiedAt in the JSON index', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      const modifiedAt = new Date('2025-06-01T10:00:00.000Z');
      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U2',
        name: 'Unit 2',
        description: '',
        metadata: {},
        player: 'player-1',
        lastChangedMetadata: modifiedAt
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('my-uuid-5678');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '', schemeType: ''
      } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      const downloadSettings = {
        unitIdList: [2],
        exportFormat: 'json',
        addPlayers: false,
        addComments: false,
        addRichNotes: false,
        addTestTakersHot: 0,
        addTestTakersMonitor: 0,
        addTestTakersReview: 0
      } as unknown as UnitDownloadSettingsDto;

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        downloadSettings,
        'json'
      );

      const jsonCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U2.json');
      expect(jsonCall).toBeDefined();
      const parsed = JSON.parse((jsonCall[1] as Buffer).toString());
      expect(parsed.uuid).toBe('my-uuid-5678');
      expect(parsed.modifiedAt).toBe('2025-06-01T10:00:00.000Z');
      expect(parsed.id).toBe('U2');
    });

    it('should only include external blocks when data is present', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U3',
        name: 'Unit 3',
        description: '',
        metadata: {},
        player: '',
        lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-3');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '', schemeType: ''
      } as unknown as UnitSchemeDto);
      unitCommentServiceMock.findOnesComments.mockResolvedValue([]);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      const downloadSettings = {
        unitIdList: [3],
        exportFormat: 'json',
        addPlayers: false,
        addComments: true,
        addRichNotes: true,
        addTestTakersHot: 0,
        addTestTakersMonitor: 0,
        addTestTakersReview: 0
      } as unknown as UnitDownloadSettingsDto;

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        downloadSettings,
        'json'
      );

      const jsonCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U3.json');
      const parsed = JSON.parse((jsonCall[1] as Buffer).toString());
      expect(parsed.codingScheme).toBeUndefined();
      expect(parsed.comments).toBeUndefined();
      expect(parsed.richNotes).toBeUndefined();
      expect(parsed.metadata).toBeUndefined();
      expect(parsed.variables).toBeUndefined();
    });

    it('should use id (not fileName) in external data blocks', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U4',
        name: 'Unit 4',
        description: '',
        metadata: { profile: 'x' },
        player: 'player-1',
        lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-4');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>', variables: [{ id: 'v1', type: 'string' }]
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: JSON.stringify({ variableCodings: [] }), schemeType: 'iqb-coding-scheme'
      } as unknown as UnitSchemeDto);
      unitCommentServiceMock.findOnesComments.mockResolvedValue([{ id: 1 }] as unknown as UnitCommentDto[]);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({
        tags: [],
        notes: [{
          tagId: 't1', content: 'note', links: [], itemReferences: []
        } as unknown as UnitRichNoteDto]
      } as UnitRichNotesDto);
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      const downloadSettings = {
        unitIdList: [4],
        exportFormat: 'json',
        addPlayers: false,
        addComments: true,
        addRichNotes: true,
        addTestTakersHot: 0,
        addTestTakersMonitor: 0,
        addTestTakersReview: 0
      } as unknown as UnitDownloadSettingsDto;

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        downloadSettings,
        'json'
      );

      const jsonCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U4.json');
      const parsed = JSON.parse((jsonCall[1] as Buffer).toString());

      expect(parsed.codingScheme).toMatchObject({ id: 'U4.vocs.json', type: 'iqb-coding-scheme' });
      expect(parsed.comments).toEqual({ id: 'U4.voco.json', type: 'iqb-unit-comments' });
      expect(parsed.richNotes).toEqual({ id: 'U4.vorn.json', type: 'iqb-unit-rich-notes' });
      expect(parsed.metadata).toMatchObject({ id: 'U4.vomd.json', type: 'metadata-values' });
      expect(parsed.variables).toMatchObject({ id: 'U4.vova.json', type: 'unit-variables' });
    });

    it('should set modifiedAt on userInterface and external blocks when timestamps are available', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      const definitionChanged = new Date('2025-03-01T08:00:00.000Z');
      const schemeChanged = new Date('2025-04-01T09:00:00.000Z');
      const metadataChanged = new Date('2025-05-01T10:00:00.000Z');

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U6',
        name: 'Unit 6',
        description: '',
        metadata: { x: 1 },
        player: 'player-1',
        lastChangedMetadata: metadataChanged,
        lastChangedDefinition: definitionChanged,
        lastChangedScheme: schemeChanged
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-6');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>', variables: [{ id: 'v1', type: 'string' }]
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: JSON.stringify({ variableCodings: [] }), schemeType: 'iqb-coding-scheme'
      } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        {
          unitIdList: [6],
          addPlayers: false,
          addComments: false,
          addRichNotes: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0
        } as unknown as UnitDownloadSettingsDto,
        'json'
      );

      const jsonCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U6.json');
      const parsed = JSON.parse((jsonCall[1] as Buffer).toString());

      expect(parsed.userInterface.modifiedAt).toBe(definitionChanged.toISOString());
      expect(parsed.codingScheme.modifiedAt).toBe(schemeChanged.toISOString());
      expect(parsed.metadata.modifiedAt).toBe(metadataChanged.toISOString());
      expect(parsed.variables.modifiedAt).toBe(definitionChanged.toISOString());
    });

    it('should always include player in userInterface even when empty', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U5',
        name: 'Unit 5',
        description: '',
        metadata: {},
        player: '',
        lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-5');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({ scheme: '', schemeType: '' } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        {
          unitIdList: [5],
          addPlayers: false,
          addComments: false,
          addRichNotes: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0
        } as unknown as UnitDownloadSettingsDto,
        'json'
      );

      const jsonCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U5.json');
      const parsed = JSON.parse((jsonCall[1] as Buffer).toString());
      expect(parsed.userInterface).toHaveProperty('player');
    });
  });

  describe('buildVariablesJSON', () => {
    const unitDownloadClass = UnitDownloadClass as unknown as {
      buildVariablesJSON: (
        definitionData: UnitDefinitionDto,
        schemeData: UnitSchemeDto
      ) => { baseVariables: unknown[]; derivedVariables: unknown[] } | null;
    };

    it('should return null when no variables exist', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        { scheme: '', schemeType: '' } as unknown as UnitSchemeDto
      );
      expect(result).toBeNull();
    });

    it('should return baseVariables from definition', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        {
          definition: '',
          variables: [{ id: 'v1', type: 'string' }]
        } as unknown as UnitDefinitionDto,
        { scheme: '', schemeType: '' } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.baseVariables).toHaveLength(1);
      expect(result.derivedVariables).toHaveLength(0);
    });

    it('should set id and basedOn for derived variables, exclude BASE entries', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        {
          scheme: JSON.stringify({
            variableCodings: [
              { id: 'b1', sourceType: 'BASE', alias: 'b1' },
              {
                id: 'd1', sourceType: 'SUM_CODE', alias: 'd1_alias', deriveSources: ['b1', 'b2']
              }
            ]
          }),
          schemeType: 'test'
        } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.derivedVariables).toHaveLength(1);
      expect(result.derivedVariables[0]).toEqual({ id: 'd1_alias', basedOn: ['b1', 'b2'] });
    });

    it('should use empty array for basedOn when deriveSources is absent', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        {
          scheme: JSON.stringify({
            variableCodings: [
              { id: 'd1', sourceType: 'CONCAT_CODE' }
            ]
          }),
          schemeType: 'test'
        } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.derivedVariables[0]).toEqual({ id: 'd1', basedOn: [] });
    });
  });
});
