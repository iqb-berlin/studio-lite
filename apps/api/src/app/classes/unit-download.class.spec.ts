import { createMock } from '@golevelup/ts-jest';
import {
  ItemsMetadataValues,
  MetadataValues,
  UnitCommentDto,
  UnitDownloadBookletSettingsDto,
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
import { ExportReportMessage, UnitDownloadClass } from './unit-download.class';
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
        metadata: {
          profiles: [{
            profileId: 'https://example.org/unit-profile.json',
            isCurrent: true,
            entries: [{
              id: 'a1',
              label: [{ lang: 'de', value: 'Autor:in' }],
              value: [{ lang: 'de', value: 'Ana Maier' }],
              valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
            }]
          }]
        },
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
      expect(parsed.metadata).toMatchObject({ id: 'U4.vomd.json', type: 'unit-metadata@0.1' });
      expect(parsed.variables).toMatchObject({ id: 'U4.vova.json', type: 'unit-variables' });
    });

    it('should write voco.json in the unit-comments spec shape and drop non-spec fields', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U5', name: 'Unit 5', description: '', player: 'player-1', lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-5');
      unitServiceMock.findOnesDefinition.mockResolvedValue(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto
      );
      unitServiceMock.findOnesScheme.mockResolvedValue(undefined as unknown as UnitSchemeDto);
      unitCommentServiceMock.findOnesComments.mockResolvedValue([{
        id: 7,
        body: 'a comment',
        userName: 'Jane Doe',
        userId: 42,
        unitId: 99,
        parentId: 3,
        hidden: true,
        createdAt: new Date('2026-04-09T13:15:10.977Z'),
        changedAt: new Date('2026-04-10T13:15:10.977Z'),
        itemUuids: ['item-uuid-1'],
        upVotes: 5,
        downVotes: 2,
        userVote: 'up'
      }] as unknown as UnitCommentDto[]);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] } as unknown as UnitRichNotesDto);
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      const downloadSettings = {
        unitIdList: [5],
        exportFormat: 'json',
        addPlayers: false,
        addComments: true,
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

      const vocoCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U5.voco.json');
      expect(vocoCall).toBeDefined();
      const parsed = JSON.parse((vocoCall[1] as Buffer).toString());
      expect(parsed).toEqual([{
        id: 7,
        body: 'a comment',
        commentator: 'Jane Doe',
        parentComment: 3,
        isHidden: true,
        createdAt: '2026-04-09T13:15:10.977Z',
        changedAt: '2026-04-10T13:15:10.977Z',
        itemUuids: ['item-uuid-1']
      }]);
      // non-spec fields must be absent (additionalProperties: false)
      expect(parsed[0]).not.toHaveProperty('userId');
      expect(parsed[0]).not.toHaveProperty('unitId');
      expect(parsed[0]).not.toHaveProperty('upVotes');
      expect(parsed[0]).not.toHaveProperty('downVotes');
      expect(parsed[0]).not.toHaveProperty('userVote');
      expect(parsed[0]).not.toHaveProperty('userName');
      expect(parsed[0]).not.toHaveProperty('hidden');
      expect(parsed[0]).not.toHaveProperty('parentId');
    });

    it('should omit optional comment fields when they are empty', () => {
      const result = UnitDownloadClass.transformComments([{
        id: 1, body: 'minimal', userName: '', parentId: null, hidden: false
      } as unknown as UnitCommentDto]);
      expect(result).toEqual([{ id: 1, body: 'minimal' }]);
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
        metadata: {
          profiles: [{
            profileId: 'https://example.org/unit-profile.json',
            isCurrent: true,
            entries: [{
              id: 'a1',
              label: [{ lang: 'de', value: 'Autor:in' }],
              value: [{ lang: 'de', value: 'Ana Maier' }],
              valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
            }]
          }]
        },
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

    it('should write vomd.json as unit-metadata@0.1 wrapper and voit.json as unit-items@0.2', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      const lastChangedMetadata = new Date('2025-05-01T08:00:00.000Z');
      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U6',
        name: 'Unit 6',
        description: '',
        metadata: {
          profiles: [{
            profileId: 'https://example.org/unit-profile.json',
            isCurrent: true,
            entries: [{
              id: 'a1',
              label: [{ lang: 'de', value: 'Für SPF geeignet' }],
              value: 'false',
              valueAsText: { lang: 'de', value: 'nein' }
            }, {
              id: 'iqb_phones',
              label: [{ lang: 'de', value: 'Kopfhörer' }],
              value: [],
              valueAsText: []
            }]
          }],
          items: [{
            uuid: 'item-uuid-1',
            id: 'ITEM1',
            description: 'Notiz',
            order: 3,
            position: '01',
            locked: false,
            unitId: 6,
            weighting: 2,
            variableId: 'VAR1',
            variableReadOnlyId: 'var-uuid-1',
            changedAt: '2025-04-01T00:00:00.000Z',
            profiles: [{
              profileId: 'https://example.org/item-profile.json',
              isCurrent: true,
              entries: [{
                id: 'w4',
                label: [{ lang: 'de', value: 'Prozess' }],
                value: [{ id: 'https://w3id.org/iqb/vocab/p2', text: [{ lang: 'de', value: 'Anwenden' }] }],
                valueAsText: [{ lang: 'de', value: 'Anwenden' }]
              }]
            }]
          }]
        },
        player: 'player-1',
        lastChangedMetadata
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-6');
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

      const vomdCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U6.vomd.json');
      expect(vomdCall).toBeDefined();
      const vomd = JSON.parse((vomdCall[1] as Buffer).toString());
      expect(vomd).toEqual({
        changedAt: '2025-05-01T08:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'a1',
            label: [{ lang: 'de', value: 'Für SPF geeignet' }],
            value: { raw: 'false', asText: [{ lang: 'de', value: 'nein' }] }
          }]
        }]
      });

      const voitCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U6.voit.json');
      expect(voitCall).toBeDefined();
      const voit = JSON.parse((voitCall[1] as Buffer).toString());
      expect(voit).toEqual([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        description: 'Notiz',
        order: 3,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1',
        changedAt: '2025-04-01T00:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/item-profile.json',
          entries: [{
            id: 'w4',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ id: 'https://w3id.org/iqb/vocab/p2', label: [{ lang: 'de', value: 'Anwenden' }] }]
          }]
        }]
      }]);

      const indexCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'U6.json');
      const index = JSON.parse((indexCall[1] as Buffer).toString());
      expect(index.metadata).toEqual({
        id: 'U6.vomd.json',
        type: 'unit-metadata@0.1',
        modifiedAt: '2025-05-01T08:00:00.000Z'
      });
      expect(index.items).toEqual({
        id: 'U6.voit.json',
        type: 'unit-items@0.2',
        modifiedAt: '2025-05-01T08:00:00.000Z'
      });

      const addedFiles = mockZip.addFile.mock.calls.map((c: string[]) => c[0]);
      expect(addedFiles).not.toContain('export-report.json');
    });

    it('should add an export-report.json when legacy metadata cannot be exported', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U7',
        name: 'Unit 7',
        description: '',
        metadata: { profile: 'https://example.org/old-profile.json' },
        player: 'player-1'
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-7');
      unitServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '', schemeType: ''
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
          unitIdList: [7],
          addPlayers: false,
          addComments: false,
          addRichNotes: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0
        } as unknown as UnitDownloadSettingsDto,
        'json'
      );

      const addedFiles = mockZip.addFile.mock.calls.map((c: string[]) => c[0]);
      expect(addedFiles).not.toContain('U7.vomd.json');

      const reportCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === 'export-report.json');
      expect(reportCall).toBeDefined();
      const report = JSON.parse((reportCall[1] as Buffer).toString());
      expect(report.messages).toEqual([{
        unitKey: 'U7',
        objectKey: 'U7.vomd.json',
        messageKey: 'unit-download.api-warning.metadata-not-exported'
      }]);
    });
  });

  describe('transformProfilesToMetadataValues', () => {
    it('should map internal profiles to metadata-values@3.0 and drop internal-only fields', () => {
      const result = UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'https://example.org/profile.json',
        isCurrent: true,
        entries: [{
          id: 'iqb_author',
          label: [{ lang: 'de', value: 'Entwickler:in' }],
          value: [{ lang: 'de', value: 'Ana Maier' }],
          valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
        }]
      }] as unknown as MetadataValues[]);

      expect(result).toEqual([{
        profileId: 'https://example.org/profile.json',
        entries: [{
          id: 'iqb_author',
          label: [{ lang: 'de', value: 'Entwickler:in' }],
          value: [{ lang: 'de', value: 'Ana Maier' }]
        }]
      }]);
    });

    it('should omit profiles without profileId or without exportable entries', () => {
      const result = UnitDownloadClass.transformProfilesToMetadataValues([
        { isCurrent: true, entries: [{ id: 'a1', value: 'x', valueAsText: [] }] },
        { profileId: 'p1', entries: [{ id: 'empty', value: [], valueAsText: [] }] },
        { profileId: 'p2', entries: [] }
      ] as unknown as MetadataValues[]);
      expect(result).toEqual([]);
    });

    it('should map vocabulary values with text to vocabulary_entries with label', () => {
      const result = UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'w8',
          label: [{ lang: 'de', value: 'Leitidee' }],
          value: [{ id: 'https://w3id.org/iqb/vocab/l3', text: [{ lang: 'de', value: 'Raum und Form' }] }],
          valueAsText: [{ lang: 'de', value: 'Raum und Form' }]
        }]
      }] as unknown as MetadataValues[]);

      expect(result[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: 'Raum und Form' }]
      }]);
    });

    it('should map string values to simple_value and skip empty strings', () => {
      const result = UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [
          {
            id: 'a1', label: [], value: 'true', valueAsText: { lang: 'de', value: 'ja' }
          },
          {
            id: 'a2', label: [], value: '', valueAsText: []
          }
        ]
      }] as unknown as MetadataValues[]);

      expect(result[0].entries).toEqual([{
        id: 'a1',
        value: { raw: 'true', asText: [{ lang: 'de', value: 'ja' }] }
      }]);
    });

    it('should drop label and asText entries without a valid two-letter language code', () => {
      const result = UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'a1',
          label: [{ value: 'no lang' }],
          value: 'x',
          valueAsText: [{ value: 'no lang either' }]
        }]
      }] as unknown as MetadataValues[]);

      expect(result[0].entries).toEqual([{ id: 'a1', value: { raw: 'x' } }]);
    });
  });

  describe('transformItems', () => {
    it('should map internal items to unit-items@0.2 and drop non-spec fields', () => {
      const result = UnitDownloadClass.transformItems([{
        uuid: 'u1',
        id: 'ITEM1',
        description: 'Desc',
        order: 1,
        position: '01',
        locked: true,
        unitId: 12,
        weighting: 2,
        variableId: 'VAR1',
        variableReadOnlyId: 'var-uuid-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        changedAt: '2025-02-01T00:00:00.000Z',
        profiles: []
      }] as unknown as ItemsMetadataValues[]);

      expect(result).toEqual([{
        uuid: 'u1',
        id: 'ITEM1',
        description: 'Desc',
        order: 1,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        changedAt: '2025-02-01T00:00:00.000Z'
      }]);
    });

    it('should skip items without id and derive order from the position in the list', () => {
      const result = UnitDownloadClass.transformItems([
        { uuid: 'u1', profiles: [] },
        { uuid: 'u2', id: 'ITEM2', profiles: [] }
      ] as unknown as ItemsMetadataValues[]);

      expect(result).toEqual([{ uuid: 'u2', id: 'ITEM2', order: 1 }]);
    });

    it('should return an empty array for missing items', () => {
      expect(UnitDownloadClass.transformItems(undefined)).toEqual([]);
    });
  });

  describe('export report', () => {
    const makeScope = (objectKey: string) => ({
      unitKey: 'U1',
      objectKey,
      messages: [] as ExportReportMessage[]
    });

    it('should report texts dropped for an invalid language code', () => {
      const scope = makeScope('U1.vomd.json');
      UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [], value: [{ lang: 'de-DE', value: 'Text' }], valueAsText: []
        }]
      }] as unknown as MetadataValues[], scope);

      expect(scope.messages).toEqual([{
        unitKey: 'U1',
        objectKey: 'U1.vomd.json',
        messageKey: 'unit-download.api-warning.invalid-language-code',
        details: {
          profileId: 'p1', entryId: 'e1', lang: 'de-DE', value: 'Text'
        }
      }]);
    });

    it('should report when plain texts are dropped from a mixed vocabulary value', () => {
      const scope = makeScope('U1.vomd.json');
      const result = UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [
            { id: 'v1', text: [{ lang: 'de', value: 'A' }] },
            { lang: 'de', value: 'B' }
          ],
          valueAsText: []
        }]
      }] as unknown as MetadataValues[], scope);

      expect(result[0].entries[0].value).toEqual([{ id: 'v1', label: [{ lang: 'de', value: 'A' }] }]);
      expect(scope.messages).toEqual([expect.objectContaining({
        messageKey: 'unit-download.api-warning.mixed-value-dropped',
        details: { profileId: 'p1', entryId: 'e1', droppedCount: '1' }
      })]);
    });

    it('should report a profile that is dropped for a missing profileId', () => {
      const scope = makeScope('U1.vomd.json');
      UnitDownloadClass.transformProfilesToMetadataValues([{
        entries: [{
          id: 'e1', label: [], value: 'x', valueAsText: []
        }]
      }] as unknown as MetadataValues[], scope);

      expect(scope.messages).toEqual([expect.objectContaining({
        messageKey: 'unit-download.api-warning.profile-not-exported'
      })]);
    });

    it('should report an item that is dropped for a missing id', () => {
      const scope = makeScope('U1.voit.json');
      UnitDownloadClass.transformItems(
        [{ uuid: 'item-uuid-1', profiles: [] }] as unknown as ItemsMetadataValues[],
        scope
      );

      expect(scope.messages).toEqual([{
        unitKey: 'U1',
        objectKey: 'U1.voit.json',
        messageKey: 'unit-download.api-warning.item-not-exported',
        details: { uuid: 'item-uuid-1' }
      }]);
    });

    it('should not report anything for clean data', () => {
      const scope = makeScope('U1.vomd.json');
      UnitDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [{ lang: 'de', value: 'L' }], value: 'x', valueAsText: []
        }]
      }] as unknown as MetadataValues[], scope);

      expect(scope.messages).toEqual([]);
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

  describe('transformRichNotes', () => {
    it('should map a note onto the unit-rich-notes spec shape', () => {
      const notes = [{
        tagId: 'tag-1',
        content: '<p>note</p>',
        links: [{ url: 'https://example.org', label: 'Ref' }],
        itemReferences: ['item-uuid-1']
      }] as unknown as UnitRichNoteDto[];
      const tags = [
        { id: 'tag-1', label: [{ lang: 'de', value: 'Tag Label' }] }
      ] as unknown as UnitRichNoteTagDto[];

      const result = UnitDownloadClass.transformRichNotes(notes, tags);

      expect(result).toEqual([{
        tagId: 'tag-1',
        tagLabel: 'Tag Label',
        content: '<p>note</p>',
        links: [{ url: 'https://example.org', label: 'Ref' }],
        itemUuids: ['item-uuid-1']
      }]);
    });

    it('should omit links and itemUuids when empty (spec minItems: 1)', () => {
      const notes = [{
        tagId: 'tag-1',
        content: 'note',
        links: [],
        itemReferences: []
      }] as unknown as UnitRichNoteDto[];

      const result = UnitDownloadClass.transformRichNotes(notes, []);

      expect(result[0]).not.toHaveProperty('links');
      expect(result[0]).not.toHaveProperty('itemUuids');
      expect(result[0]).not.toHaveProperty('tagLabel');
      expect(result[0]).toEqual({ tagId: 'tag-1', content: 'note' });
    });

    it('should omit links when the column is null', () => {
      const notes = [{
        tagId: 'tag-1',
        content: 'note',
        links: null,
        itemReferences: ['item-uuid-1']
      }] as unknown as UnitRichNoteDto[];

      const result = UnitDownloadClass.transformRichNotes(notes, []);

      expect(result[0]).not.toHaveProperty('links');
      expect(result[0].itemUuids).toEqual(['item-uuid-1']);
    });
  });

  describe('safeBookletId', () => {
    it('should return booklet1 when input is undefined', () => {
      expect(UnitDownloadClass.safeBookletId(undefined)).toBe('booklet1');
    });

    it('should return booklet1 when input is empty string', () => {
      expect(UnitDownloadClass.safeBookletId('')).toBe('booklet1');
    });

    it('should return the value unchanged when it contains only safe characters', () => {
      expect(UnitDownloadClass.safeBookletId('myBooklet-1_A')).toBe('myBooklet-1_A');
    });

    it('should replace path separators and unsafe characters with underscores', () => {
      expect(UnitDownloadClass.safeBookletId('../../evil')).toBe('______evil');
    });
  });

  describe('createBookletXml', () => {
    const exportConfig = createMock<UnitExportConfigDto>({ bookletXsdUrl: 'booklet.xsd' });

    it('should use default Id and empty Label when no args provided', () => {
      const xml = UnitDownloadClass.createBookletXml(exportConfig).toString();
      expect(xml).toContain('<Id>booklet1</Id>');
      expect(xml).toContain('<Label/>');
    });

    it('should use custom Id and Label when provided', () => {
      const xml = UnitDownloadClass.createBookletXml(exportConfig, 'myStudy', 'Mein Testheft').toString();
      expect(xml).toContain('<Id>myStudy</Id>');
      expect(xml).toContain('<Label>Mein Testheft</Label>');
    });
  });

  describe('addBooklet', () => {
    const exportConfig = createMock<UnitExportConfigDto>({ bookletXsdUrl: 'booklet.xsd' });
    const units: UnitPropertiesDto[] = [
      createMock<UnitPropertiesDto>({ key: 'unit1', name: 'Aufgabe A' }),
      createMock<UnitPropertiesDto>({ key: 'unit2', name: '' })
    ];

    it('should write booklet1.xml when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: undefined, bookletSettings: [] });
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith(
        'booklet1.xml',
        expect.any(Buffer)
      );
    });

    it('should write <bookletId>.xml when bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: 'studie2025', bookletSettings: [] });
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('studie2025.xml', expect.any(Buffer));
    });

    it('should sanitize bookletId used as filename', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: 'a/b', bookletSettings: [] });
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('a_b.xml', expect.any(Buffer));
    });

    it('should write an empty label when bookletLabel is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>(
        { bookletId: undefined, bookletLabel: undefined, bookletSettings: [] }
      );
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('<Label/>');
    });

    it('should use provided bookletLabel in the XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>(
        { bookletId: undefined, bookletLabel: 'Mein Test', bookletSettings: [] }
      );
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('<Label>Mein Test</Label>');
    });

    it('should use unit index as labelshort', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: undefined, bookletSettings: [] });
      UnitDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('labelshort="1"');
      expect(xmlContent).toContain('labelshort="2"');
    });
  });

  describe('addTestTakers', () => {
    const exportConfig = createMock<UnitExportConfigDto>(
      { bookletXsdUrl: 'booklet.xsd', testTakersXsdUrl: 'testtakers.xsd' }
    );

    const baseSettings: Partial<UnitDownloadSettingsDto> = {
      bookletId: undefined,
      groupLabel: undefined,
      monitorBookletVisibility: undefined,
      addTestTakersReview: 1,
      addTestTakersHot: 0,
      addTestTakersMonitor: 0,
      passwordLess: true,
      bookletSettings: [] as UnitDownloadBookletSettingsDto[]
    };

    it('should write booklet1_testtaker.xml when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('booklet1_testtaker.xml', expect.any(Buffer));
    });

    it('should write <bookletId>_testtaker.xml when bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('studie2025_testtaker.xml', expect.any(Buffer));
    });

    it('should reference booklet1 in testtaker XML when no bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('>booklet1<');
    });

    it('should reference custom bookletId in testtaker XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('>studie2025<');
    });

    it('should use bookletId_group as group id', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('id="studie2025_group"');
    });

    it('should use booklet1_group as group id when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('id="booklet1_group"');
    });

    it('should use groupLabel in group label attribute', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, groupLabel: 'Meine Gruppe' });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('label="Meine Gruppe"');
    });

    it('should write an empty group label when groupLabel is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('label=""');
    });

    it('should not include CustomTexts in testtaker XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('CustomText');
      expect(xmlContent).not.toContain('login_testEndButtonLabel');
    });

    it('should write ViewSettings with monitorBookletVisibility for monitor login', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1,
        monitorBookletVisibility: 'collapsed'
      });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('ViewSettings');
      expect(xmlContent).toContain('collapsed');
    });

    it('should not write ViewSettings when monitorBookletVisibility is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1
      });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('ViewSettings');
    });

    it('should not include Booklet element in monitor login', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1
      });
      UnitDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('<Booklet>');
    });
  });
});
