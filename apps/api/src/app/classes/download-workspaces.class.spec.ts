import { createMock } from '@golevelup/ts-jest';
import * as Excel from 'exceljs';
import {
  UnitPropertiesDto,
  CodeBookContentSetting,
  CodebookUnitDto,
  WorkspaceGroupDto,
  MissingsProfilesDto
} from '@studio-lite-lib/api-dto';
import { Logger } from '@nestjs/common';
import { DownloadWorkspacesClass } from './download-workspaces.class';
import { DownloadDocx } from './download-docx.class';
import { UnitService } from '../services/unit.service';
import { SettingService } from '../services/setting.service';
import { WorkspaceService } from '../services/workspace.service';

jest.mock('exceljs');
jest.mock('./download-docx.class', () => ({
  DownloadDocx: {
    getDocXCodebook: jest.fn().mockReturnValue(Buffer.from('docx-data'))
  }
}));

jest.mock('@iqbspecs/coding-scheme', () => ({
  CodingScheme: jest.fn().mockImplementation(schemeData => (typeof schemeData === 'string' ? JSON.parse(schemeData) : schemeData))
}));

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
                weighting: 1,
                description: 'Desc1',
                profiles: [
                  {
                    isCurrent: true,
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
        Wichtung: 1,
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
                    isCurrent: true,
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
                isCurrent: true,
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

  describe('getWorkspaceCodingBook', () => {
    it('should return JSON buffer when format is not docx', async () => {
      const unitServiceMock = createMock<UnitService>();
      const settingsServiceMock = createMock<SettingService>();

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1, key: 'U1', name: 'Unit 1', scheme: null, metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);
      settingsServiceMock.findMissingsProfiles.mockResolvedValue([]);

      const contentSetting = {
        exportFormat: 'json',
        missingsProfile: 'default'
      } as unknown as CodeBookContentSetting;

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        unitServiceMock,
        settingsServiceMock,
        contentSetting,
        [1]
      );

      expect(Buffer.isBuffer(result)).toBe(true);
      const data = JSON.parse((result as Buffer).toString()) as CodebookUnitDto[];
      expect(data[0].key).toBe('U1');
    });

    it('should call DownloadDocx when format is docx', async () => {
      const unitServiceMock = createMock<UnitService>();
      const settingsServiceMock = createMock<SettingService>();

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1, key: 'U1', name: 'Unit 1', scheme: null, metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);
      settingsServiceMock.findMissingsProfiles.mockResolvedValue([]);

      const contentSetting = {
        exportFormat: 'docx',
        missingsProfile: 'default'
      } as unknown as CodeBookContentSetting;

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        unitServiceMock,
        settingsServiceMock,
        contentSetting,
        [1]
      );

      expect(DownloadDocx.getDocXCodebook).toHaveBeenCalled();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect((result as Buffer).toString()).toBe('docx-data');
    });

    it('should log a warning if codebook is empty for selected units', async () => {
      const unitServiceMock = createMock<UnitService>();
      const settingsServiceMock = createMock<SettingService>();

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1, key: 'U1', name: 'Unit 1', scheme: null, metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);
      settingsServiceMock.findMissingsProfiles.mockResolvedValue([]);

      const contentSetting = {
        exportFormat: 'json',
        missingsProfile: 'default'
      } as unknown as CodeBookContentSetting;

      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      // Empty unitList means selectedUnits will be empty, so codebook array is empty
      await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        unitServiceMock,
        settingsServiceMock,
        contentSetting,
        []
      );

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Can not create codebook for units in workspace 1 with unit ids '
      );
      loggerWarnSpy.mockRestore();
    });

    it('should handle invalid UI profile missings safely (catch block in getProfileMissings)', async () => {
      const unitServiceMock = createMock<UnitService>();
      const settingsServiceMock = createMock<SettingService>();

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1, key: 'U1', name: 'Unit 1', scheme: null, metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);

      // Returns a profile with unparseable missings JSON string
      settingsServiceMock.findMissingsProfiles.mockResolvedValue([
        {
          label: 'default',
          missings: 'invalid-json-{,'
        } as unknown as MissingsProfilesDto
      ]);

      const contentSetting = {
        exportFormat: 'json',
        missingsProfile: 'default'
      } as unknown as CodeBookContentSetting;

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        unitServiceMock,
        settingsServiceMock,
        contentSetting,
        [1]
      );

      const data = JSON.parse((result as Buffer).toString()) as CodebookUnitDto[];
      expect(data[0].missings).toEqual([]);
    });

    it('should handle older schemer versions (code objects without rules)', async () => {
      const unitServiceMock = createMock<UnitService>();
      const settingsServiceMock = createMock<SettingService>();

      const schemeWithOldCode = JSON.stringify({
        variableCodings: [
          {
            id: 'v_old',
            alias: '',
            label: 'Old var',
            sourceType: 'BASE',
            manualInstruction: 'Old instruction',
            // Code without 'rules'
            codes: [
              {
                id: 10,
                label: 'Old code',
                score: 1,
                type: 'INTENDED',
                manualInstruction: 'instr'
                // rules purposely omitted to trigger older schema fallback
              }
            ]
          }
        ]
      });

      unitServiceMock.findAllWithProperties.mockResolvedValue([
        {
          id: 1, key: 'U1', name: 'Unit 1', scheme: schemeWithOldCode, metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);
      settingsServiceMock.findMissingsProfiles.mockResolvedValue([]);

      const contentSetting = {
        exportFormat: 'json',
        missingsProfile: 'default',
        hasOnlyVarsWithCodes: false,
        showScore: true
      } as unknown as CodeBookContentSetting;

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        unitServiceMock,
        settingsServiceMock,
        contentSetting,
        [1]
      );

      const data = JSON.parse((result as Buffer).toString()) as CodebookUnitDto[];
      const codes = data[0].variables![0].codes;
      expect(codes).toHaveLength(1);
      expect(codes[0].id).toBe('10');
      expect(codes[0].score).toBe('1');
    });
  });

  describe('variable filter logic (hasOnlyVarsWithCodes + sub-filters)', () => {
    // Three variables: v_manual (manualInstruction code), v_closed (RESIDUAL_AUTO), v_uncoded (neither)
    const makeCode = (id: number, type: string, manualInstruction: string) => ({
      id,
      label: `Code ${id}`,
      score: 1,
      type,
      manualInstruction,
      rules: [],
      ruleSetDescriptions: []
    });

    const scheme = JSON.stringify({
      variableCodings: [
        {
          id: 'v_manual',
          alias: '',
          label: 'Manual var',
          sourceType: 'BASE',
          manualInstruction: '',
          codes: [makeCode(1, 'INTENDED', 'do it')]
        },
        {
          id: 'v_manual_but_only_closed',
          alias: '',
          label: 'Manual but residual auto',
          sourceType: 'BASE',
          manualInstruction: '',
          codes: [makeCode(11, 'RESIDUAL_AUTO', 'do it')]
        },
        {
          id: 'v_mixed',
          alias: '',
          label: 'Mixed var',
          sourceType: 'BASE',
          manualInstruction: '',
          codes: [
            makeCode(21, 'INTENDED', 'do it'),
            makeCode(22, 'RESIDUAL_AUTO', '')
          ]
        },
        {
          id: 'v_closed',
          alias: '',
          label: 'Closed var',
          sourceType: 'BASE',
          manualInstruction: '',
          codes: [makeCode(2, 'RESIDUAL_AUTO', '')]
        },
        {
          id: 'v_uncoded',
          alias: '',
          label: 'Uncoded var',
          sourceType: 'BASE',
          manualInstruction: '',
          codes: [makeCode(3, 'INTENDED', '')]
        }
      ]
    });

    const baseSettings: CodeBookContentSetting = {
      exportFormat: 'json',
      missingsProfile: '',
      hasClosedVars: false,
      hasOnlyManualCoding: false,
      hasDerivedVars: false,
      hasGeneralInstructions: false,
      codeLabelToUpper: false,
      showScore: false,
      hideItemVarRelation: false,
      hasOnlyVarsWithCodes: false
    };

    const getVarIds = async (settings: CodeBookContentSetting): Promise<string[]> => {
      const unitSvc = createMock<UnitService>();
      unitSvc.findAllWithProperties.mockResolvedValue([
        {
          id: 1,
          key: 'U1',
          name: 'Unit 1',
          scheme,
          metadata: { items: [] }
        } as unknown as UnitPropertiesDto
      ]);
      const settingsSvc = createMock<SettingService>();
      settingsSvc.findMissingsProfiles.mockResolvedValue([]);
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1, unitSvc, settingsSvc, settings, [1]
      );
      const data = JSON.parse((result as Buffer).toString()) as CodebookUnitDto[];
      return data[0].variables!.map(v => v.id);
    };

    it('includes all vars when no filter is active', async () => {
      const ids = await getVarIds({ ...baseSettings });
      expect(ids).toContain('v_manual');
      expect(ids).toContain('v_manual_but_only_closed');
      expect(ids).toContain('v_mixed');
      expect(ids).toContain('v_closed');
      expect(ids).toContain('v_uncoded');
    });

    it('hasOnlyVarsWithCodes=true excludes vars without coded types', async () => {
      const ids = await getVarIds({ ...baseSettings, hasOnlyVarsWithCodes: true });
      expect(ids).toContain('v_manual');
      expect(ids).toContain('v_manual_but_only_closed');
      expect(ids).toContain('v_mixed');
      expect(ids).toContain('v_closed');
      expect(ids).not.toContain('v_uncoded');
    });

    it(
      'hasOnlyManualCoding=true includes manual var but EXCLUDES the ' +
      'one with only RESIDUAL_AUTO code, and EXCLUDES purely mixed variables',
      async () => {
        const ids = await getVarIds({
          ...baseSettings,
          hasOnlyVarsWithCodes: false, // Testing that it still applies Even if this is false!
          hasOnlyManualCoding: true
        });
        expect(ids).toContain('v_manual'); // manual and INTENDED (not auto)
        expect(ids).not.toContain('v_manual_but_only_closed'); // strictly excluded due to isClosed=true
        expect(ids).not.toContain('v_mixed'); // strictly excluded due to isClosed=true
        expect(ids).not.toContain('v_closed');
        expect(ids).not.toContain('v_uncoded');
      }
    );

    it(
      'hasClosedVars=true includes closed var AND includes mixed ' +
      'ones (not strictly mutually exclusive like Manual)',
      async () => {
        const ids = await getVarIds({
          ...baseSettings,
          hasOnlyVarsWithCodes: false, // Testing that it still applies Even if this is false!
          hasClosedVars: true
        });
        expect(ids).not.toContain('v_manual');
        expect(ids).toContain('v_manual_but_only_closed');
        expect(ids).toContain('v_mixed');
        expect(ids).toContain('v_closed');
        expect(ids).not.toContain('v_uncoded');
      }
    );

    it(
      'both sub-filters on: includes vars matching EITHER filter (OR semantics) ' +
      'even with hasOnlyVarsWithCodes false',
      async () => {
        const ids = await getVarIds({
          ...baseSettings,
          hasOnlyVarsWithCodes: false,
          hasOnlyManualCoding: true,
          hasClosedVars: true
        });
        expect(ids).toContain('v_manual'); // manual-only: included via OR
        expect(ids).toContain('v_manual_but_only_closed'); // Because BOTH filters are on, it matches 'isManual' OR 'isClosed' and is included!
        expect(ids).toContain('v_closed'); // closed-only: included via OR
        expect(ids).not.toContain('v_uncoded');
      }
    );
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
