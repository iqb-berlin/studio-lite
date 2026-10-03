// exceljs is CommonJS with no statically detectable named exports -- see the note on the katex
// import in download-docx.class.ts.
import Excel from 'exceljs';
import {
  CodeBookContentSetting,
  MissingsProfilesDto
} from '@studio-lite-lib/api-dto';
import { BadRequestException } from '@nestjs/common';
import { CodebookGenerator, CodebookGenerationError } from '@iqb/ngx-coding-components/codebook-generator';
import type { UnitPropertiesForCodebook } from '@iqb/ngx-coding-components/codebook-models';
import { isCurrentFromOrder } from '@studio-lite/shared-code';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { SettingService } from '../services/setting.service';

interface WorkspaceData {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  latestChange: Date | null;
  unitNumber: number;
  editors: { [key: string]: number };
  players: { [key: string]: number };
  schemers: { [key: string]: number };
}

type Missing = {
  id: string;
  label: string;
  description: string;
  code: number;
};

export class DownloadWorkspacesClass {
  static setUnitsItemsDataRows(units) {
    const allUnits = [];
    units.forEach(unit => {
      const totalValues: Record<string, string>[] = [];
      if (unit.metadata.items) {
        unit.metadata.items.forEach((item, i: number) => {
          const activeProfile = item.profiles?.find(
            profile => isCurrentFromOrder(profile.order)
          );
          if (activeProfile) {
            const values: Record<string, string> = {};
            activeProfile.entries.forEach(entry => {
              if (entry.valueAsText.length > 1) {
                const textValues = [];
                entry.valueAsText.forEach(textValue => {
                  textValues.push(`${textValue.value || ''}`);
                });
                values[entry.label[0].value] = textValues.join('<br>');
              } else {
                values[entry.label[0].value] =
                  entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
              }
              if (i === 0) values.Aufgabe = unit.key || '–';
              values['Item-Id'] = item.id || '–';
              values.Variable = item.variableId || '';
              values.Notiz = item.description || '';
              values.Aufgabe = unit.key || '–';
            });
            totalValues.push(values);
          } else {
            totalValues.push({
              Aufgabe: unit.key || '-',
              'Item-Id': item.id || '–',
              Variable: item.variableId,
              Notiz: item.description
            });
          }
        });
      }
      allUnits.push(totalValues);
    });
    return allUnits.flat();
  }

  static setUnitsDataRows(units) {
    const totalValues: Record<string, string>[] = [];
    units.forEach(unit => {
      const activeProfile = unit.metadata.profiles?.find(
        profile => isCurrentFromOrder(profile.order)
      );
      if (activeProfile) {
        const values: Record<string, string> = {};
        activeProfile.entries.forEach(entry => {
          if (entry.valueAsText.length > 1) {
            const textValues = [];
            entry.valueAsText.forEach(textValue => {
              textValues.push(textValue.value || '');
            });
            values[entry.label[0].value] = textValues.join(', ');
          } else {
            values[entry.label[0].value] =
              entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
          }
          values.Aufgabe = unit.key || '–';
        });
        totalValues.push(values);
      } else {
        totalValues.push({ Aufgabe: unit.key || '–' });
      }
    });
    return totalValues.flat();
  }

  private static mapColumnNames(columns: string[]): string[] {
    return columns.map(column => {
      if (column === 'key') {
        return 'Aufgabe';
      }
      if (column === 'description') {
        return 'Notiz';
      }
      if (column === 'variableId') {
        return 'Variable';
      }
      if (column === 'id') {
        return 'Item-Id';
      }
      return column;
    });
  }

  static async getWorkspaceMetadataReport(
    reportType: string,
    unitService: UnitService,
    workspaceId: number,
    columns: string[],
    units: number[]
  ): Promise<Buffer> {
    const mappedColumnNames = DownloadWorkspacesClass.mapColumnNames(columns);
    const unitsFromWorkspace = await unitService.findAllWithProperties(
      workspaceId
    );
    const unitsFiltered = unitsFromWorkspace.filter(unit => units.find(su => Number(su) === unit.id)
    );
    const rows =
      reportType === 'unit' ?
        this.setUnitsDataRows(unitsFiltered) :
        this.setUnitsItemsDataRows(unitsFiltered);
    const SHEET_NAME =
      reportType === 'unit' ? 'Aufgaben Metadaten ' : ' Items Metadaten ';
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet(SHEET_NAME);
    wb.created = new Date();
    wb.title = 'Webanwendung IQB Studio';
    wb.subject =
      reportType === 'unit' ? 'Metadaten der Aufgaben' : 'Metadaten der Items';
    ws.columns = mappedColumnNames.map((column: string) => ({
      header: column,
      key: column,
      width: 30,
      style: { alignment: { wrapText: true, vertical: 'top' } }
    }));
    ws.getRow(1).font = { bold: true };
    ws.addRows(rows);
    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  static async getWorkspaceCodingBook(
    workspaceId: number,
    unitService: UnitService,
    settingsService: SettingService,
    contentSetting: CodeBookContentSetting,
    unitList: number[]
  ): Promise<Buffer> {
    const units = await unitService.findAllWithProperties(workspaceId);
    const selectedUnits = units.filter(unit => unitList.includes(unit.id));
    const profiles = await settingsService.findMissingsProfiles();
    const missings = profiles.length ?
      this.getProfileMissings(profiles, contentSetting.missingsProfile) :
      [];
    const normalizedUnits: UnitPropertiesForCodebook[] = selectedUnits.map(unit => {
      // Metadata stores the source ID; documents display the coding alias.
      let aliases = new Map<string, string>();
      try {
        const schema = JSON.parse(unit.scheme || '{}');
        aliases = new Map((schema.variableCodings || []).map((variable: { id: string; alias?: string }) => [variable.id, variable.alias || variable.id]));
      } catch { /* The shared generator reports malformed schemas with the unit key. */ }
      return {
        id: unit.id,
        key: unit.key,
        name: unit.name,
        scheme: unit.scheme || undefined,
        metadata: {
          items: (unit.metadata?.items || []).filter(item => item.id && item.variableId)
            .map(item => ({ id: item.id, variableId: aliases.get(item.variableId) || item.variableId }))
        }
      };
    });
    try {
      const blob = await CodebookGenerator.generateCodebook(normalizedUnits, contentSetting, missings);
      return Buffer.from(await blob.arrayBuffer());
    } catch (error) {
      if (error instanceof CodebookGenerationError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  private static getProfileMissings(
    profiles: MissingsProfilesDto[],
    missingsProfile: string
  ): Missing[] {
    let missings: Missing[] = [];
    try {
      const foundProfile = profiles.find(
        profile => profile.label === missingsProfile
      );
      if (foundProfile) {
        missings = JSON.parse(foundProfile.missings);
      }
    } catch {
      missings = [];
    }
    return missings;
  }

  static async getWorkspaceReport(
    workspaceService: WorkspaceService,
    unitService: UnitService,
    workspaceGroupId: number
  ): Promise<Buffer> {
    const SHEET_NAME = 'Arbeitsbereiche';
    const wb = new Excel.Workbook();
    wb.created = new Date();
    wb.title = 'Webanwendung IQB Studio';
    wb.subject = 'Daten der Arbeitsbereiche ';
    const ws = wb.addWorksheet(SHEET_NAME);
    const allGroups = await workspaceService.findAllGroupwise();
    const wsDataWithMetadataPromises: Promise<WorkspaceData>[] = [];
    allGroups.forEach(group => {
      if (workspaceGroupId === 0 || group.id === workspaceGroupId) {
        group.workspaces.forEach(w => {
          wsDataWithMetadataPromises.push(
            unitService.findAllWithProperties(w.id).then(unitData => {
              const returnData = <WorkspaceData>{
                id: w.id,
                name: w.name,
                groupId: group.id,
                groupName: group.name,
                latestChange: null,
                unitNumber: unitData.length,
                editors: {},
                players: {},
                schemers: {}
              };
              unitData.forEach(u => {
                if (u.lastChangedMetadata !== null) {
                  returnData.latestChange = u.lastChangedMetadata;
                } else {
                  returnData.latestChange = null;
                }

                if (returnData.latestChange < u.lastChangedDefinition) returnData.latestChange = u.lastChangedDefinition;
                if (returnData.latestChange < u.lastChangedScheme) returnData.latestChange = u.lastChangedScheme;
                if (returnData.editors[u.editor]) {
                  returnData.editors[u.editor] += 1;
                } else {
                  returnData.editors[u.editor] = 1;
                }
                if (returnData.players[u.player]) {
                  returnData.players[u.player] += 1;
                } else {
                  returnData.players[u.player] = 1;
                }
                if (returnData.schemers[u.schemer]) {
                  returnData.schemers[u.schemer] += 1;
                } else {
                  returnData.schemers[u.schemer] = 1;
                }
              });
              return returnData;
            })
          );
        });
      }
    });
    const wsDataWithMetadata = await Promise.all(wsDataWithMetadataPromises);
    const allEditors = [
      ...new Set(wsDataWithMetadata.map(d => Object.keys(d.editors)).flat())
    ];
    const allPlayers = [
      ...new Set(wsDataWithMetadata.map(d => Object.keys(d.players)).flat())
    ];
    const allSchemers = [
      ...new Set(wsDataWithMetadata.map(d => Object.keys(d.schemers)).flat())
    ];
    const headerRow = [
      'Gruppe Name',
      'Gruppe Id',
      'Arbeitsbereich Name',
      'Arbeitsbereich Id',
      'Letzte Änderung',
      'Anzahl Units'
    ];
    ws.getRow(1).font = { bold: true };

    allEditors.forEach(m => {
      headerRow.push(m || 'Kein Editor');
    });
    allPlayers.forEach(m => {
      headerRow.push(m || 'Kein Player');
    });
    allSchemers.forEach(m => {
      headerRow.push(m || 'Kein Schemer');
    });

    ws.columns = headerRow.map((column: string) => ({
      header: column,
      key: column,
      width: 20,
      style: { alignment: { wrapText: true, horizontal: 'left' } }
    }));
    wsDataWithMetadata.forEach(wsData => {
      let date = '';
      if (wsData.latestChange !== null) {
        date = `${wsData.latestChange.getDate()}.${
          wsData.latestChange.getMonth() + 1
        }.${wsData.latestChange.getFullYear()}`;
      }
      const rowData = [
        wsData.groupName,
        wsData.groupId,
        wsData.name,
        wsData.id,
        date,
        wsData.unitNumber
      ];
      allEditors.forEach(moduleKey => {
        rowData.push(
          wsData.editors[moduleKey] ? wsData.editors[moduleKey] : ''
        );
      });
      allPlayers.forEach(moduleKey => {
        rowData.push(
          wsData.players[moduleKey] ? wsData.players[moduleKey] : ''
        );
      });
      allSchemers.forEach(moduleKey => {
        rowData.push(
          wsData.schemers[moduleKey] ? wsData.schemers[moduleKey] : ''
        );
      });

      const data = {};
      headerRow.forEach((column, i) => {
        data[column] = rowData[i];
      });
      ws.addRows([data]);
    });
    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
