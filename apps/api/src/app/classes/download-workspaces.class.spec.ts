import { createMock } from '@golevelup/ts-jest';
import * as Excel from 'exceljs';
import {
  UnitPropertiesDto,
  CodeBookContentSetting,
  CodebookUnitDto,
  WorkspaceGroupDto
} from '@studio-lite-lib/api-dto';
import { DownloadWorkspacesClass } from './download-workspaces.class';
import { UnitService } from '../services/unit.service';
import { SettingService } from '../services/setting.service';
import { WorkspaceService } from '../services/workspace.service';

jest.mock('exceljs');

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
