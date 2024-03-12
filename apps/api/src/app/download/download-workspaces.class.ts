import * as Excel from 'exceljs';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import {
  CodeData, CodingRule, RuleSet, VariableCodingData, ToTextFactory
} from '@iqb/responses';
import { WorkspaceService } from '../database/services/workspace.service';
import { UnitService } from '../database/services/unit.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
const HTMLtoDOCX = require('html-to-docx');

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

interface CodingBook {
  key: string;
  name: string;
  variables: any;

}

export class DownloadWorkspacesClass {
  static setUnitsItemsDataRows(units: any[]): any {
    const allUnits: any[] = [];
    units.forEach((unit: any) => {
      const totalValues: Record<string, string>[] = [];
      if (unit.metadata.items) {
        unit.metadata.items.forEach((item: any, i: number) => {
          const activeProfile: any = item.profiles?.find((profile: any) => profile.isCurrent);
          if (activeProfile) {
            const values: Record<string, string> = {};
            activeProfile.entries.forEach((entry: any) => {
              if (entry.valueAsText.length > 1) {
                const textValues: any[] = [];
                entry.valueAsText.forEach((textValue: any) => {
                  textValues.push(`${textValue.value || ''}`);
                });
                values[entry.label[0].value] = textValues.join('<br>');
              } else {
                values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
              }
              if (i === 0) values.Aufgabe = unit.key || '–';
              values['Item-Id'] = item.id || '–';
              values.Variablen = item.variableId || '';
              values.Wichtung = item.weighting || '';
              values.Notiz = item.description || '';
            });
            totalValues.push(values);
          } else {
            totalValues.push({ 'Item-Id': '–' });
          }
        });
      }
      allUnits.push(totalValues);
    });
    return allUnits.flat();
  }

  static setUnitsDataRows(units: any): any {
    const totalValues: Record<string, string>[] = [];
    units.forEach((unit: any) => {
      const activeProfile = unit.metadata.profiles?.find((profile: any) => profile.isCurrent);
      if (activeProfile) {
        const values: Record<string, string> = {};
        activeProfile.entries.forEach((entry: any) => {
          if (entry.valueAsText.length > 1) {
            const textValues: any[] = [];
            entry.valueAsText.forEach((textValue: any) => {
              textValues.push(textValue.value || '');
            });
            values[entry.label[0].value] = textValues.join(', ');
          } else {
            values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
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

  static async getWorkspaceMetadataReport(reportType: string,
                                          unitService: UnitService,
                                          workspaceId: number,
                                          columns:string): Promise<Buffer> {
    const data = await unitService.findAllWithMetadata(workspaceId);
    const rows = (reportType === 'units') ? this.setUnitsDataRows(data) : this.setUnitsItemsDataRows(data);
    const SHEET_NAME = (reportType === 'units') ? 'Aufgaben Metadaten ' : ' Items Metadaten ';
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet(SHEET_NAME);
    wb.created = new Date();
    wb.title = 'Webanwendung IQB Studio';
    wb.subject = (reportType === 'units') ? 'Metadaten der Aufgaben' : 'Metadaten der Items';
    ws.columns = decodeURIComponent(columns).split(',').map((column: string) => ({
      header: column,
      key: column,
      width: 30,
      style: { alignment: { wrapText: true } }
    }));
    ws.getRow(1).font = { bold: true };
    ws.addRows(rows);
    return await wb.xlsx.writeBuffer() as Buffer;
  }

  static async getWorkspaceCodingBook(workspaceGroupId:number,
                                      unitService: UnitService,
                                      exportFormat:'json' | 'docx',
                                      hasOnlyManualCodings:string,
                                      hasClosedCodings:string,
                                      unitList:string): Promise<Buffer> {
    const codingBook: CodingBook[] = [];
    let docHtml = '';
    let unitsHtml = '';
    const units = await unitService.findAllWithMetadata(workspaceGroupId);
    const selectedUnits =
        units.filter(unit => unitList.split(',')
          .map((u:string) => parseInt(u, 10))
          .includes(unit.id));
    selectedUnits.forEach((unit: UnitMetadataDto) => {
      const unitHeaderHtml = `<h2><u>${unit.key} ${unit.name}</u></h2>`;
      const parsedScheme: any = JSON.parse(unit.scheme);
      let variablesHtml = '';
      let bookVariables = [];
      if (parsedScheme?.variableCodings) {
        parsedScheme?.variableCodings.forEach((variableCoding: VariableCodingData) => {
          const variableHeaderHtml = `<h3>${variableCoding.id}</h3><p>${variableCoding.label}   ${variableCoding.page}</p><p>${variableCoding.manualInstruction}</p>`;
          let codesHtml = '';
          let codes = [];
          let closedCodingVar:boolean;
          let onlyManualCodingVar:boolean;
          let hasRules = false;
          if (variableCoding.codes.length > 0) {
            variableCoding.codes.forEach((code: CodeData) => {
              const codeAsText = ToTextFactory.codeAsText(code);
              const hasManualInstruction = code.manualInstruction.length > 0;
              code.ruleSets.forEach((ruleSet: RuleSet) => {
                onlyManualCodingVar = (hasManualInstruction && ruleSet.rules.length === 0);
                hasRules = ruleSet.rules.length > 0;
                ruleSet.rules.forEach((rule: CodingRule) => {
                  if (rule.method === 'ELSE') {
                    closedCodingVar = true;
                  }
                });
              });
              let rulesDescription = '';
              codeAsText.ruleSetDescriptions.forEach((ruleSetDescription: string) => {
                rulesDescription += `<p>${ruleSetDescription}</p>`;
              });
              const codeHtml = `<tr><td>${code.id}</td><td>${codeAsText.score} ${codeAsText.scoreLabel}</td><td>${codeAsText.label}</td><td>${rulesDescription}${code.manualInstruction}</td></tr>`;

              codesHtml += codeHtml;
              const codeInfo = {
                id: code.id,
                label: codeAsText.label,
                score: codeAsText.score,
                scoreLabel: codeAsText.scoreLabel,
                description: `${rulesDescription}${code.manualInstruction}`
              };
              codes = [...codes, codeInfo];
            });
          }
          const variableCodesTableHtml = `<table><tr><th style="background-color:#d9d9d9">Code</th><th style="background-color:#d9d9d9">Score</th><th style="background-color:#d9d9d9">Label</th><th style="background-color:#d9d9d9">Beschreibung</th></tr>${codesHtml}</table>`;
          if (codesHtml.length > 0) {
            if ((closedCodingVar && hasClosedCodings) || (onlyManualCodingVar && hasOnlyManualCodings) || (hasRules && !closedCodingVar)) {
              bookVariables = [...bookVariables, {
                id: variableCoding.id,
                label: variableCoding.label,
                generalInstruction: variableCoding.manualInstruction,
                codes: codes
              }];
              variablesHtml += `${variableHeaderHtml}${variableCodesTableHtml}`;
            }
          }
        });
      }
      if (variablesHtml) {
        codingBook.push(
          {
            key: unit.key,
            name: unit.name,
            variables: bookVariables
          }
        );
        unitsHtml += `${unitHeaderHtml}${variablesHtml}`;
      }
    });
    docHtml = `<!DOCTYPE html><html lang="de"><head><title></title><style>th {background-color:#d9d9d9}</style></head><body>${unitsHtml}</body></body></html>`;

    if (exportFormat === 'docx') {
      return new Promise(resolve => {
        resolve(HTMLtoDOCX(docHtml, null, {
          title: 'IQB-Studio Kodierbuch ',
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
          lang: 'de-DE',
          orientation: 'landscape',
          'font-size': '12pt'
        }));
      });
    }

    return new Promise(resolve => {
      const data = JSON.stringify(codingBook);
      resolve(Buffer.from(data, 'utf-8'));
    });
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
            unitService.findAllWithMetadata(w.id)
              .then(unitData => {
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
        date = `${wsData.latestChange.getDate()}
        .${wsData.latestChange.getMonth() + 1}.${wsData.latestChange.getFullYear()}`;
      }
      const rowData = [
        wsData.groupName, wsData.groupId, wsData.name, wsData.id,
        date, wsData.unitNumber
      ];
      allEditors.forEach(moduleKey => {
        rowData.push(wsData.editors[moduleKey] ? wsData.editors[moduleKey] : '');
      });
      allPlayers.forEach(moduleKey => {
        rowData.push(wsData.players[moduleKey] ? wsData.players[moduleKey] : '');
      });
      allSchemers.forEach(moduleKey => {
        rowData.push(wsData.schemers[moduleKey] ? wsData.schemers[moduleKey] : '');
      });

      const data = {};
      headerRow.forEach((column, i) => {
        data[column] = rowData[i];
      });
      ws.addRows([data]);
    });
    return await wb.xlsx.writeBuffer() as Buffer;
  }
}
