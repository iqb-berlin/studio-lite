import { createMock } from '@golevelup/ts-jest';
import {
  UnitMetadataValues, UnitCommentDto, UnitDownloadSettingsDto, UnitExportConfigDto, UnitPropertiesDto, UnitDefinitionDto, UnitRichNoteDto, UnitRichNotesDto, UnitSchemeDto, VeronaModuleInListDto, VeronaModuleFileDto
} from '@studio-lite-lib/api-dto';
// `unstable_mockModule` is missing from the global `jest` object's type, so it comes from here.
// It is aliased because the global `jest` -- used for `jest.fn()` below -- types its mocks
// loosely, and importing over that name would make every `mockReturnValue` a type error.
import { jest as jestEsm } from '@jest/globals';
import type { UnitService } from '../services/unit.service';
import type { UnitMetadataService } from '../services/unit-metadata.service';
import type { UnitDefinitionService } from '../services/unit-definition.service';
import type { UnitCommentService } from '../services/unit-comment.service';
import type { VeronaModulesService } from '../services/verona-modules.service';
import type { SettingService } from '../services/setting.service';
import type { UnitRichNoteService } from '../services/unit-rich-note.service';

// ESM module namespaces are frozen, so a replacement has to be registered before the module is
// pulled in -- which is why the two imports below are dynamic.
jestEsm.unstable_mockModule('adm-zip', () => ({
  default: jest.fn()
}));

const AdmZipMock = (await import('adm-zip')).default as unknown as jest.Mock;
const { UnitDownloadClass } = await import('./unit-download.class');
const { UnitJsonDownloadClass } = await import('./unit-json-download.class');

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
    AdmZipMock.mockImplementation(() => mockZip);
  });

  describe('get', () => {
    it('should create a zip with unit data and players', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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

      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: 'def'
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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

  // XML carries the format as DefinitionRef/@type, JSON as userInterface.type (#1368).
  describe('definition type', () => {
    const exportUnit = async (exportFormat: 'xml' | 'json', definitionType?: string) => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U1', name: 'Unit 1', metadata: {}, player: 'iqb-player-aspect@3.0'
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-1');
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '{}', variables: [], ...(definitionType && { definitionType })
      } as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({ scheme: '', schemeType: '' } as UnitSchemeDto);
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
        createMock<UnitCommentService>(),
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        {
          unitIdList: [1],
          exportFormat,
          addPlayers: false,
          addComments: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0
        } as unknown as UnitDownloadSettingsDto,
        exportFormat
      );
      const file = mockZip.addFile.mock.calls
        .find((call: [string, Buffer]) => call[0] === `U1.${exportFormat}`);
      return (file[1] as Buffer).toString();
    };

    it('should write the type as an attribute of DefinitionRef', async () => {
      const xml = await exportUnit('xml', 'aspect-unit-definition@4.12.0');

      expect(xml).toMatch(/<DefinitionRef [^>]*type="aspect-unit-definition@4\.12\.0"/);
    });

    it('should write no type attribute when none is stored', async () => {
      const xml = await exportUnit('xml');

      expect(xml).toMatch(/<DefinitionRef /);
      expect(xml).not.toMatch(/<DefinitionRef [^>]*type=/);
    });

    it('should write the type into userInterface of the JSON index', async () => {
      const index = JSON.parse(await exportUnit('json', 'aspect-unit-definition@4.12.0'));

      expect(index.userInterface.type).toBe('aspect-unit-definition@4.12.0');
    });

    it('should leave userInterface.type out when none is stored', async () => {
      const index = JSON.parse(await exportUnit('json'));

      expect(index.userInterface).not.toHaveProperty('type');
    });
  });

  // Metadata, items and the coding scheme can be left out, and no file is written without content
  // (#1729). A missing flag keeps the file, so callers that do not know the flags lose nothing.
  describe('optional files', () => {
    const profiles = [{
      profileId: 'p1',
      order: 0,
      entries: [{
        id: 'e1', label: [], value: 'x', valueAsText: []
      }]
    }];
    const items = [{ id: 'item1' }];

    const exportUnit = async (
      exportFormat: 'xml' | 'json',
      flags: Partial<UnitDownloadSettingsDto>,
      metadata: UnitMetadataValues = { profiles, items },
      scheme = '{"variableCodings":[]}'
    ) => {
      // several exports in one test share the zip mock
      mockZip.addFile.mockClear();
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
      const settingServiceMock = createMock<SettingService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U1', name: 'Unit 1', metadata, player: 'iqb-player-aspect@3.0', schemer: 'iqb-schemer@2.0'
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-1');
      unitMetadataServiceMock.buildHideNumberingMap.mockResolvedValue({});
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({ definition: '{}', variables: [] } as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({ scheme, schemeType: '' } as UnitSchemeDto);
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
        createMock<UnitCommentService>(),
        veronaModuleServiceMock,
        settingServiceMock,
        createMock<UnitRichNoteService>(),
        {
          unitIdList: [1],
          exportFormat,
          addPlayers: false,
          addComments: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0,
          ...flags
        } as unknown as UnitDownloadSettingsDto,
        exportFormat
      );
      const files = mockZip.addFile.mock.calls.map((call: [string, Buffer]) => call[0]);
      const unitFile = mockZip.addFile.mock.calls
        .find((call: [string, Buffer]) => call[0] === `U1.${exportFormat}`)[1].toString();
      return { files, unitFile };
    };

    describe('xml', () => {
      it('should write metadata and scheme when the flags are missing', async () => {
        const { files, unitFile } = await exportUnit('xml', {});

        expect(files).toEqual(expect.arrayContaining(['U1.vomd', 'U1.vocs']));
        expect(unitFile).toContain('<Reference>U1.vomd</Reference>');
        expect(unitFile).toMatch(/<CodingSchemeRef [^>]*schemer="iqb-schemer@2.0"[^>]*>U1.vocs</);
      });

      it('should write no metadata file and no reference for empty metadata', async () => {
        const { files, unitFile } = await exportUnit('xml', {}, { profiles: [], items: [] });

        expect(files).not.toContain('U1.vomd');
        expect(unitFile).not.toContain('U1.vomd');
      });

      it('should write the metadata file for items alone, since they live in it', async () => {
        const { files } = await exportUnit('xml', {}, { profiles: [], items });

        expect(files).toContain('U1.vomd');
      });

      it('should leave metadata and items out with addMetadata false, and ignore addItems', async () => {
        const left = await exportUnit('xml', { addMetadata: false, addItems: true });
        const kept = await exportUnit('xml', { addItems: false });

        expect(left.files).not.toContain('U1.vomd');
        expect(left.unitFile).not.toContain('U1.vomd');
        expect(kept.files).toContain('U1.vomd');
      });

      it('should leave the scheme file and the whole CodingSchemeRef out with addCodingScheme false', async () => {
        const { files, unitFile } = await exportUnit('xml', { addCodingScheme: false });

        expect(files).not.toContain('U1.vocs');
        expect(unitFile).not.toContain('CodingSchemeRef');
      });
    });

    describe('json', () => {
      it('should write metadata, items and scheme when the flags are missing', async () => {
        const { files, unitFile } = await exportUnit('json', {});
        const index = JSON.parse(unitFile);

        expect(files).toEqual(expect.arrayContaining(['U1.vomd.json', 'U1.voit.json', 'U1.vocs.json']));
        expect(index).toHaveProperty('metadata');
        expect(index).toHaveProperty('items');
        expect(index).toHaveProperty('codingScheme');
      });

      it('should leave out each file, and its index entry, by its own flag', async () => {
        const noMetadata = await exportUnit('json', { addMetadata: false });
        const noItems = await exportUnit('json', { addItems: false });
        const noScheme = await exportUnit('json', { addCodingScheme: false });

        expect(noMetadata.files).not.toContain('U1.vomd.json');
        expect(noMetadata.files).toContain('U1.voit.json');
        expect(JSON.parse(noMetadata.unitFile)).not.toHaveProperty('metadata');
        expect(noItems.files).not.toContain('U1.voit.json');
        expect(noItems.files).toContain('U1.vomd.json');
        expect(JSON.parse(noItems.unitFile)).not.toHaveProperty('items');
        expect(noScheme.files).not.toContain('U1.vocs.json');
        expect(JSON.parse(noScheme.unitFile)).not.toHaveProperty('codingScheme');
      });

      it('should not report legacy metadata as dropped when metadata is left out on purpose', async () => {
        const legacyMetadata = { legacyKey: 'x' } as UnitMetadataValues;
        const { files } = await exportUnit('json', { addMetadata: false }, legacyMetadata);

        expect(files).not.toContain('_export-report.json');
      });
    });

    // The testcenter reads units only as XML, so a booklet beside JSON units would name missing units (#1477).
    it('should write booklet and test takers for logins only in the XML format', async () => {
      const xml = await exportUnit('xml', { addTestTakersHot: 1, bookletSettings: [] });
      const json = await exportUnit('json', { addTestTakersHot: 1, bookletSettings: [] });

      expect(xml.files).toEqual(expect.arrayContaining(['booklet1.xml', 'booklet1_testtaker.xml']));
      expect(json.files).not.toContain('booklet1.xml');
      expect(json.files).not.toContain('booklet1_testtaker.xml');
    });
  });

  describe('get with exportFormat json', () => {
    it('should create key.json index file and not key.xml', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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

      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>',
        variables: []
      } as unknown as UnitDefinitionDto);

      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
            order: 0,
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>', variables: [{ id: 'v1', type: 'string' }]
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U5', name: 'Unit 5', description: '', player: 'player-1', lastChangedMetadata: new Date()
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-5');
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto
      );
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue(undefined as unknown as UnitSchemeDto);
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
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const result = UnitJsonDownloadClass.transformComments([{
        id: 1, body: 'minimal', userName: '', parentId: null, hidden: false
      } as unknown as UnitCommentDto]);
      expect(result).toEqual([{ id: 1, body: 'minimal' }]);
    });

    it('should set modifiedAt on userInterface and external blocks when timestamps are available', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
            order: 0,
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '<content/>', variables: [{ id: 'v1', type: 'string' }]
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
        scheme: JSON.stringify({ variableCodings: [] }), schemeType: 'iqb-coding-scheme'
      } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({ scheme: '', schemeType: '' } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
            order: 0,
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
              order: 0,
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({ scheme: '', schemeType: '' } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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
          order: 0,
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
          order: 0,
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
      expect(addedFiles).not.toContain('_export-report.json');
    });

    it('should add an export report file when legacy metadata cannot be exported', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
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
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '', schemeType: ''
      } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
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

      const reportCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === '_export-report.json');
      expect(reportCall).toBeDefined();
      const report = JSON.parse((reportCall[1] as Buffer).toString());
      expect(report.messages).toEqual([{
        unitKey: 'U7',
        objectKey: 'U7.vomd.json',
        messageKey: 'dropped-content.metadata-not-exported'
      }]);
    });

    it('should not add a second metadata message when the transform already reported the drop', async () => {
      const unitServiceMock = createMock<UnitService>();
      const unitMetadataServiceMock = createMock<UnitMetadataService>();
      const unitDefinitionServiceMock = createMock<UnitDefinitionService>();
      const unitCommentServiceMock = createMock<UnitCommentService>();
      const veronaModuleServiceMock = createMock<VeronaModulesService>();
      const settingServiceMock = createMock<SettingService>();
      const unitRichNoteServiceMock = createMock<UnitRichNoteService>();

      settingServiceMock.findUnitExportConfig.mockResolvedValue({} as UnitExportConfigDto);
      unitServiceMock.findOnesProperties.mockResolvedValue({
        key: 'U8',
        name: 'Unit 8',
        description: '',
        metadata: {
          profiles: [{
            entries: [
              { id: 'a1', value: 'x', valueAsText: [] },
              { id: 'a2', value: 'y', valueAsText: [] }
            ]
          }]
        },
        player: 'player-1'
      } as unknown as UnitPropertiesDto);
      unitServiceMock.ensureUuid.mockResolvedValue('uuid-8');
      unitDefinitionServiceMock.findOnesDefinition.mockResolvedValue({
        definition: '', variables: []
      } as unknown as UnitDefinitionDto);
      unitDefinitionServiceMock.findOnesScheme.mockResolvedValue({
        scheme: '', schemeType: ''
      } as unknown as UnitSchemeDto);
      unitRichNoteServiceMock.findNotes.mockResolvedValue({ tags: [], notes: [] });
      veronaModuleServiceMock.findAll.mockResolvedValue([]);

      await UnitDownloadClass.get(
        1,
        unitServiceMock,
        unitMetadataServiceMock,
        unitDefinitionServiceMock,
        unitCommentServiceMock,
        veronaModuleServiceMock,
        settingServiceMock,
        unitRichNoteServiceMock,
        {
          unitIdList: [8],
          addPlayers: false,
          addComments: false,
          addRichNotes: false,
          addTestTakersHot: 0,
          addTestTakersMonitor: 0,
          addTestTakersReview: 0
        } as unknown as UnitDownloadSettingsDto,
        'json'
      );

      const reportCall = mockZip.addFile.mock.calls.find((c: unknown[]) => c[0] === '_export-report.json');
      expect(reportCall).toBeDefined();
      const report = JSON.parse((reportCall[1] as Buffer).toString());
      expect(report.messages).toEqual([{
        unitKey: 'U8',
        objectKey: 'U8.vomd.json',
        messageKey: 'dropped-content.profile-not-exported',
        details: { entryCount: '2' }
      }]);
    });
  });
});
