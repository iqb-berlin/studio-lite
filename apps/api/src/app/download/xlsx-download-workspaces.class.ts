import * as XLSX from 'xlsx';
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
    allEditors.forEach(m => { headerRow.push(m || 'Kein Editor'); });
    allPlayers.forEach(m => { headerRow.push(m || 'Kein Player'); });
    allSchemers.forEach(m => { headerRow.push(m || 'Kein Schemer'); });
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
