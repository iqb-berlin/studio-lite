import { createMock } from '@golevelup/ts-jest';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
// `unstable_mockModule` is missing from the global `jest` object's type, so it comes from here.
// It is aliased because the global `jest` -- used for `jest.fn()` below -- types its mocks
// loosely, and importing over that name would make every `mockResolvedValue` a type error.
import { jest as jestEsm } from '@jest/globals';
import {
  UnitPropertiesDto,
  CodeBookContentSetting,
  WorkspaceGroupDto
} from '@studio-lite-lib/api-dto';
import type { UnitService } from '../services/unit.service';
import type { SettingService } from '../services/setting.service';
import type { WorkspaceService } from '../services/workspace.service';

// ESM module namespaces are frozen, so a replacement has to be registered before the module is
// pulled in -- which is why everything that sees a mock is imported dynamically below.
jestEsm.unstable_mockModule('exceljs', () => ({
  default: { Workbook: jest.fn() }
}));

const Excel = (await import('exceljs')).default;
const { DownloadWorkspacesClass } = await import('./download-workspaces.class');

describe('DownloadWorkspacesClass', () => {
  describe('setUnitsItemsDataRows', () => {
    it('should map unit metadata to item rows correctly', () => {
      const units = [
        {
          key: 'UNIT1',
          metadata: {
            items: [
              {
                id: 'ITEM1',
                variableId: 'VAR1',
                description: 'Desc1',
                profiles: [
                  {
                    order: 0,
                    entries: [
                      {
                        label: [{ value: 'EntryLabel' }],
                        valueAsText: [{ value: 'EntryValue' }]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ] as unknown as UnitPropertiesDto[];

      const result = DownloadWorkspacesClass.setUnitsItemsDataRows(units);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        EntryLabel: 'EntryValue',
        Aufgabe: 'UNIT1',
        'Item-Id': 'ITEM1',
        Variable: 'VAR1',
        Notiz: 'Desc1'
      });
    });

    it('should handle multiple entries in item profile', () => {
      const units = [
        {
          key: 'UNIT1',
          metadata: {
            items: [
              {
                id: 'ITEM1',
                profiles: [
                  {
                    order: 0,
                    entries: [
                      {
                        label: [{ value: 'MultiEntry' }],
                        valueAsText: [{ value: 'Val1' }, { value: 'Val2' }]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ] as unknown as UnitPropertiesDto[];

      const result = DownloadWorkspacesClass.setUnitsItemsDataRows(units);

      expect(result[0].MultiEntry).toBe('Val1<br>Val2');
    });
  });

  describe('setUnitsDataRows', () => {
    it('should map unit metadata to unit rows correctly', () => {
      const units = [
        {
          key: 'UNIT1',
          metadata: {
            profiles: [
              {
                order: 0,
                entries: [
                  {
                    label: [{ value: 'UnitLabel' }],
                    valueAsText: [{ value: 'UnitVal' }]
                  }
                ]
              }
            ]
          }
        }
      ] as unknown as UnitPropertiesDto[];

      const result = DownloadWorkspacesClass.setUnitsDataRows(units);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        UnitLabel: 'UnitVal',
        Aufgabe: 'UNIT1'
      });
    });
  });

  describe('getWorkspaceMetadataReport', () => {
    it('should create an excel workbook with correct data', async () => {
      const unitServiceMock = createMock<UnitService>();
      unitServiceMock.findAllWithProperties.mockResolvedValue([
        { id: 1, key: 'U1', metadata: { profiles: [] } } as unknown as UnitPropertiesDto
      ]);

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          addRows: jest.fn(),
          getRow: jest.fn().mockReturnValue({ font: {} }),
          columns: []
        }),
        xlsx: {
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('excel-data'))
        }
      };
      (Excel.Workbook as unknown as jest.Mock).mockImplementation(() => mockWorkbook);

      const result = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
        'unit',
        unitServiceMock,
        1,
        ['key'],
        [1]
      );

      expect(result).toEqual(Buffer.from('excel-data'));
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Aufgaben Metadaten ');
    });
  });

  describe('getWorkspaceCodingBook shared generator integration', () => {
    const options: CodeBookContentSetting = {
      exportFormat: 'json',
      missingsProfile: 'Profil',
      hasOnlyManualCoding: true,
      hasClosedVars: false,
      hasDerivedVars: true,
      hasOnlyVarsWithCodes: true,
      hasGeneralInstructions: true,
      codeLabelToUpper: false,
      showScore: true,
      hideItemVarRelation: false
    };
    const scheme = JSON.stringify({
      version: '3.0',
      variableCodings: [{
        id: 'V',
        alias: 'V',
        label: 'Variable',
        sourceType: 'BASE',
        codes: [{
          id: 0, type: 'FULL_CREDIT', label: 'Zero', score: 0, ruleSets: [], manualInstruction: '<p>Bewerten</p>'
        },
        {
          id: 1, type: 'RESIDUAL_AUTO', score: 0, label: 'Rest', ruleSets: [], manualInstruction: ''
        }]
      }]
    });

    it('uses the corrected common selection and resolves Studio profiles by label', async () => {
      const units = createMock<UnitService>(); const settings = createMock<SettingService>();
      units.findAllWithProperties.mockResolvedValue([{
        id: 1, key: 'U', name: 'Unit', scheme, metadata: { items: [] }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([{ id: 8, label: 'Profil', missings: JSON.stringify([{ code: 0, label: 'Missing', description: 'Leer' }]) }]);
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(1, units, settings, options, [1]);
      const data = JSON.parse(result.toString());
      expect(data[0].variables[0].codes.map(code => code.id)).toEqual(['0']);
      expect(data[0].missings[0].code).toBe(0);
    });

    it.each(['required', 'not-required'] as const)(
      'applies the shared %s training filter in Studio',
      async trainingRequirement => {
        const units = createMock<UnitService>();
        const settings = createMock<SettingService>();
        const parsed = JSON.parse(scheme);
        parsed.variableCodings.push({
          ...parsed.variableCodings[0],
          id: 'TRAIN',
          alias: 'TRAIN',
          processing: ['CODER_TRAINING_REQUIRED']
        });
        units.findAllWithProperties.mockResolvedValue([{
          id: 1, key: 'U', name: 'Unit', scheme: JSON.stringify(parsed), metadata: { items: [] }
        }] as UnitPropertiesDto[]);
        settings.findMissingsProfiles.mockResolvedValue([]);
        const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
          1,
          units,
          settings,
          { ...options, trainingRequirement },
          [1]
        );
        expect(JSON.parse(result.toString())[0].variables.map(variable => variable.id)).toEqual([
          trainingRequirement === 'required' ? 'TRAIN' : 'V'
        ]);
      }
    );

    it.each([
      {
        name: 'direct list instructions',
        instruction: '<ul><li>Erstes Kriterium</li><li>Zweites Kriterium</li></ul>',
        ruleSets: [],
        expected: ['Erstes Kriterium', 'Zweites Kriterium']
      },
      {
        name: 'plain instructions after generated rule paragraphs',
        instruction: 'Manuelle Instruktion',
        ruleSets: [{ rules: [{ method: 'MATCH', parameters: ['ABC'] }], ruleOperatorAnd: true }],
        expected: ['ABC', 'Manuelle Instruktion']
      }
    ])('retains $name in complete DOCX exports', async ({ instruction, ruleSets, expected }) => {
      const units = createMock<UnitService>();
      const settings = createMock<SettingService>();
      const parsed = JSON.parse(scheme);
      parsed.variableCodings[0].codes = [{
        ...parsed.variableCodings[0].codes[0], manualInstruction: instruction, ruleSets
      }];
      units.findAllWithProperties.mockResolvedValue([{
        id: 1, key: 'U', name: 'Unit', scheme: JSON.stringify(parsed), metadata: { items: [] }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([]);
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1, units, settings, { ...options, exportFormat: 'docx', hasClosedVars: true }, [1]
      );
      const $ = load(new AdmZip(result).readAsText('word/document.xml'), { xml: true });
      const paragraphs = $('w\\:tr').first().children('w\\:tc').last()
        .find('w\\:p')
        .toArray()
        .map(paragraph => $(paragraph).find('w\\:t').text());
      expect(paragraphs).toEqual(expected);
    });

    it('returns a real DOCX for an empty selection', async () => {
      const units = createMock<UnitService>(); const settings = createMock<SettingService>();
      units.findAllWithProperties.mockResolvedValue([]); settings.findMissingsProfiles.mockResolvedValue([]);
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(1, units, settings, { ...options, exportFormat: 'docx' }, []);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.subarray(0, 2).toString()).toBe('PK');
    });
  });

  describe('getWorkspaceReport', () => {
    it('should collect workspace data and create an excel report', async () => {
      const workspaceServiceMock = createMock<WorkspaceService>();
      const unitServiceMock = createMock<UnitService>();

      workspaceServiceMock.findAllGroupwise.mockResolvedValue([
        {
          id: 1,
          name: 'Group 1',
          isAdmin: false,
          workspaces: [{ id: 10, name: 'WS 1' }]
        }
      ] as unknown as WorkspaceGroupDto[]);

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1,
          editor: 'EditorA',
          player: 'PlayerA',
          schemer: 'SchemerA',
          lastChangedMetadata: new Date('2023-01-01'),
          lastChangedDefinition: new Date('2023-01-01'),
          lastChangedScheme: new Date('2023-01-01')
        }
      ] as unknown as UnitPropertiesDto[]);

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          addRows: jest.fn(),
          getRow: jest.fn().mockReturnValue({ font: {} }),
          columns: []
        }),
        xlsx: {
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('ws-report'))
        }
      };
      (Excel.Workbook as unknown as jest.Mock).mockImplementation(() => mockWorkbook);

      const result = await DownloadWorkspacesClass.getWorkspaceReport(
        workspaceServiceMock,
        unitServiceMock,
        0
      );

      expect(result).toEqual(Buffer.from('ws-report'));
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Arbeitsbereiche');
    });
  });
});
