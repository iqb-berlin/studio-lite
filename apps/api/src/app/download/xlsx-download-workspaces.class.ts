import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import { WorkspaceService } from '../database/services/workspace.service';
import { UnitService } from '../database/services/unit.service';

interface WorkspaceData {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  latestChange: Date;
  unitNumber: number;
  editors: { [key: string]: number };
  players: { [key: string]: number };
  schemers: { [key: string]: number };
}

export class XlsxDownloadWorkspacesClass {
  static async getWorkspaceItemsMetadataReport(workspaceService: WorkspaceService, unitService: UnitService, workspaceId: number): Promise<Buffer> {
    const data = await unitService.findAllWithMetadata(workspaceId);
    const rows = this.getUnitsItemsDataRows(data);
    const SHEET_NAME = 'Metadaten Items';
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet(SHEET_NAME);
    wb.created = new Date();
    wb.title = 'Webanwendung IQB Studio';
    wb.subject = 'Daten der Aufgaben Metadaten Items';
    ws.addRows(rows);
    ws.getRow(1).values = this.getTableColumnsDefinitions(data);
    ws.getRow(2).values = (Object.values(rows[0]));
    const r3 = ws.getRow(3);
    r3.values = rows[0];
    return await wb.xlsx.writeBuffer() as Buffer;
  }

  static getUnitsItemsDataRows(units: any[]): any {
    const allUnits: any[] = [];
    units.forEach((unit: any) => {
      const totalValues: any[] = [];
      unit.metadata.items.forEach((item: any, i: number) => {
        const activeProfile: any = item.profiles?.find((profile: any) => profile.isCurrent);
        if (activeProfile) {
          const values: any = [];
          activeProfile.entries.forEach((entry: any) => {
            if (entry.valueAsText.length > 1) {
              const textValues: any[] = [];
              entry.valueAsText.forEach((textValue: any) => {
                textValues.push(textValue.value);
              });
              values[entry.label[0].value] = textValues.join(', ');
            } else {
              values[entry.label[0].value] = entry.valueAsText[0]?.value;
            }
            if (i === 0) values.Aufgabe = unit.key;
            values['Item-Id'] = item.id;
            values.Variablen = item.variableId;
            values.Wichtung = item.weighting;
            values.Notiz = item.description;
          });
          totalValues.push(values);
        }
      });
      allUnits.push(totalValues);
    });
    return allUnits.flat();
  }

  static getTableColumnsDefinitions(data: any): string[] {
    const displayedColumns: string[] = ['Aufgabe', 'Item-Id', 'Variablen', 'Wichtung', 'Notiz'];
    const metadataItems = data[0].metadata.items;
    const activeProfile = metadataItems[0].profiles?.find((profile: any) => profile.isCurrent);
    const columnsDefinitions = activeProfile?.entries?.map((entry: any) => entry.label[0].value);
    return [...displayedColumns, ...columnsDefinitions];
  }

  static getWorkspaceUnitsMetadataReport(workspaceService: WorkspaceService, unitService: UnitService, workspaceId: number): void {

  }

  static async getWorkspaceReport(
    workspaceService: WorkspaceService,
    unitService: UnitService,
    workspaceGroupId: number
  ): Promise<Buffer> {
    const SHEET_NAME = 'Arbeitsbereiche';
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: 'Webanwendung IQB Studio',
      Subject: 'Daten der Arbeitsbereiche',
      CreatedDate: new Date()
    };
    wb.SheetNames.push(SHEET_NAME);
    const allGroups = await workspaceService.findAllGroupwise();
    const wsDataWithMetadataPromises: Promise<WorkspaceData>[] = [];
    allGroups.forEach(group => {
      if (workspaceGroupId === 0 || group.id === workspaceGroupId) {
        group.workspaces.forEach(ws => {
          wsDataWithMetadataPromises.push(
            unitService.findAllWithMetadata(ws.id)
              .then(unitData => {
                const returnData = <WorkspaceData>{
                  id: ws.id,
                  name: ws.name,
                  groupId: group.id,
                  groupName: group.name,
                  latestChange: new Date(2000, 1, 1, 12, 12),
                  unitNumber: unitData.length,
                  editors: {},
                  players: {},
                  schemers: {}
                };
                unitData.forEach(u => {
                  if (
                    returnData.latestChange < u.lastChangedMetadata
                  ) returnData.latestChange = u.lastChangedMetadata;
                  if (
                    returnData.latestChange < u.lastChangedDefinition
                  ) returnData.latestChange = u.lastChangedDefinition;
                  if (
                    returnData.latestChange < u.lastChangedScheme
                  ) returnData.latestChange = u.lastChangedScheme;
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
              }));
        });
      }
    });
    const wsDataWithMetadata = await Promise.all(wsDataWithMetadataPromises);
    const allEditors = [...new Set(...wsDataWithMetadata.map(d => Object.keys(d.editors)))];
    const allPlayers = [...new Set(...wsDataWithMetadata.map(d => Object.keys(d.players)))];
    const allSchemers = [...new Set(...wsDataWithMetadata.map(d => Object.keys(d.schemers)))];
    const headerRow = [
      'Gruppe Name', 'Gruppe Id', 'Arbeitsbereich Name', 'Arbeitsbereich Id', 'Letzte Änderung', 'Anzahl Units'
    ];
    allEditors.forEach(m => {
      headerRow.push(m || 'Kein Editor');
    });
    allPlayers.forEach(m => {
      headerRow.push(m || 'Kein Player');
    });
    allSchemers.forEach(m => {
      headerRow.push(m || 'Kein Schemer');
    });
    const xlsxData = [headerRow];
    wsDataWithMetadata.forEach(wsData => {
      const rowData = [
        wsData.groupName, wsData.groupId.toString(10), wsData.name, wsData.id.toString(10),
        `${wsData.latestChange.getDay()
          .toString(10).padStart(2, '0')}.${wsData.latestChange.getMonth()
          .toString(10).padStart(2, '0')}.${wsData.latestChange.getFullYear().toString(10)}`,
        wsData.unitNumber.toString()
      ];
      allEditors.forEach(moduleKey => {
        rowData.push(wsData.editors[moduleKey] ? wsData.editors[moduleKey].toString(10) : '');
      });
      allPlayers.forEach(moduleKey => {
        rowData.push(wsData.players[moduleKey] ? wsData.players[moduleKey].toString(10) : '');
      });
      allSchemers.forEach(moduleKey => {
        rowData.push(wsData.schemers[moduleKey] ? wsData.schemers[moduleKey].toString(10) : '');
      });
      xlsxData.push(rowData);
    });
    wb.Sheets[SHEET_NAME] = XLSX.utils.aoa_to_sheet(xlsxData);
    return XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx'
    });
  }
}
