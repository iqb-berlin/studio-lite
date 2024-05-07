import * as Excel from 'exceljs';
import { UnitMetadataDto, CodebookUnitDto, CodeBookContentSetting } from '@studio-lite-lib/api-dto';
import {
  CodeData, CodingRule, RuleSet, VariableCodingData, ToTextFactory
} from '@iqb/responses';
import { WorkspaceService } from '../database/services/workspace.service';
import { UnitService } from '../database/services/unit.service';
import { DownloadDocx } from './downloadDocx.class';
import { SettingService } from '../database/services/setting.service';

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
  code:number;
};

interface BookVariable {
  id: string;
  label: string;
  generalInstruction: string;
  codes: CodeInfo[];
}

interface CodeInfo {
  id: string;
  label: string;
  score: string;
  scoreLabel: string;
  description: string;

}

export class DownloadWorkspacesClass {
  static setUnitsItemsDataRows(units) {
    const allUnits = [];
    units.forEach(unit => {
      const totalValues: Record<string, string>[] = [];
      if (unit.metadata.items) {
        unit.metadata.items.forEach((item, i: number) => {
          const activeProfile = item.profiles?.find(
            profile => profile.isCurrent
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

  static setUnitsDataRows(units) {
    const totalValues: Record<string, string>[] = [];
    units.forEach(unit => {
      const activeProfile = unit.metadata.profiles?.find(
        profile => profile.isCurrent
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

  static async getWorkspaceMetadataReport(
    reportType: string,
    unitService: UnitService,
    workspaceId: number,
    columns: string
  ): Promise<Buffer> {
    const data = await unitService.findAllWithMetadata(workspaceId);
    const rows =
      reportType === 'units' ?
        this.setUnitsDataRows(data) :
        this.setUnitsItemsDataRows(data);
    const SHEET_NAME =
      reportType === 'units' ? 'Aufgaben Metadaten ' : ' Items Metadaten ';
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet(SHEET_NAME);
    wb.created = new Date();
    wb.title = 'Webanwendung IQB Studio';
    wb.subject =
      reportType === 'units' ? 'Metadaten der Aufgaben' : 'Metadaten der Items';
    ws.columns = decodeURIComponent(columns)
      .split(',')
      .map((column: string) => ({
        header: column,
        key: column,
        width: 30,
        style: { alignment: { wrapText: true } }
      }));
    ws.getRow(1).font = { bold: true };
    ws.addRows(rows);
    return (await wb.xlsx.writeBuffer()) as Buffer;
  }

  static async getWorkspaceCodingBook(
    workspaceGroupId: number,
    unitService: UnitService,
    settingsService: SettingService,
    contentSetting: CodeBookContentSetting,
    unitList: string
  ): Promise<Buffer | []> {
    const {
      exportFormat,
      missingsProfile,
      hasClosedVars,
      hasOnlyManualCoding,
      hasDerivedVars,
      hasGeneralInstructions
    } = contentSetting;

    const units = await unitService.findAllWithMetadata(workspaceGroupId);
    const selectedUnits = units.filter(unit => unitList
      .split(',')
      .map((u: string) => parseInt(u, 10))
      .includes(unit.id)
    );
    const codebook: CodebookUnitDto[] = [];
    let missings: Missing[] = [];
    const profiles = await settingsService.findMissingsProfiles();
    if (profiles.length > 0) {
      try {
        const foundProfile = profiles.find(profile => profile.label === missingsProfile);
        if (foundProfile) {
          missings = JSON.parse(foundProfile.missings);
        }
      } catch {
        missings = [];
      }
    }

    selectedUnits.forEach((unit: UnitMetadataDto) => {
      const parsedScheme = JSON.parse(unit.scheme);
      const bookVariables: Array<BookVariable> = [];
      if (parsedScheme?.variableCodings) {
        parsedScheme?.variableCodings.forEach(
          (variableCoding: VariableCodingData) => {
            const codes = [];
            let closedCodingVar: boolean = false;
            let onlyManualCodingVar = true;
            let isDerived: boolean;
            variableCoding.sourceType === 'BASE' ?
              (isDerived = false) :
              (isDerived = true);
            if (variableCoding.codes.length > 0) {
              variableCoding.codes.forEach((code: CodeData) => {
                // Catch schemer version <1.5
                if (!Object.prototype.hasOwnProperty.call(code, 'rules')) {
                  const codeAsText = ToTextFactory.codeAsText(code);
                  if (code.manualInstruction.length === 0) onlyManualCodingVar = false;
                  code.ruleSets.forEach((ruleSet: RuleSet) => {
                    if (
                      code.manualInstruction.length > 0 &&
                      ruleSet.rules.length > 0
                    ) onlyManualCodingVar = false;
                    ruleSet.rules.forEach((rule: CodingRule) => {
                      if (rule.method === 'ELSE') {
                        closedCodingVar = true;
                      }
                    });
                  });
                  let rulesDescription = '';
                  codeAsText.ruleSetDescriptions.forEach(
                    (ruleSetDescription: string) => {
                      if (ruleSetDescription !== 'Keine Regeln definiert.') {
                        rulesDescription += `<p>${ruleSetDescription}</p>`;
                      } else if (code.manualInstruction === '') rulesDescription += `<p>${ruleSetDescription}</p>`;
                    }
                  );
                  const codeInfo = {
                    id: `${code.id}`,
                    label: codeAsText.label,
                    score: codeAsText.score,
                    scoreLabel: codeAsText.scoreLabel,
                    description: `${rulesDescription}${code.manualInstruction}`
                  };
                  codes.push(codeInfo);
                } else {
                  const codeInfo = {
                    id: `${code.id}`,
                    label: '',
                    score: '',
                    scoreLabel: '',
                    description:
                      '<p>Kodierschema mit Schemer Version ab 1.5 erzeugen!</p>'
                  };
                  codes.push(codeInfo);
                }
              });
              if (!closedCodingVar && !onlyManualCodingVar && !isDerived) {
                bookVariables.push({
                  id: variableCoding.id,
                  label: variableCoding.label,
                  generalInstruction: hasGeneralInstructions ?
                    variableCoding.manualInstruction :
                    '',
                  codes: codes
                });
              }
              if (closedCodingVar && hasClosedVars === 'true') {
                bookVariables.push({
                  id: variableCoding.id,
                  label: variableCoding.label,
                  generalInstruction: hasGeneralInstructions ?
                    variableCoding.manualInstruction :
                    '',
                  codes: codes
                });
              }
              if (onlyManualCodingVar) {
                if (hasOnlyManualCoding === 'true') {
                  bookVariables.push({
                    id: variableCoding.id,
                    label: variableCoding.label,
                    generalInstruction: hasGeneralInstructions ?
                      variableCoding.manualInstruction :
                      '',
                    codes: codes
                  });
                }
              }

              if (isDerived) {
                if (hasDerivedVars === 'true') {
                  bookVariables.push({
                    id: variableCoding.id,
                    label: variableCoding.label,
                    generalInstruction: hasGeneralInstructions ?
                      variableCoding.manualInstruction :
                      '',
                    codes: codes
                  });
                }
              }
            }
          }
        );
      }
      const sortedBookVariables = bookVariables.sort((a, b) => {
        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      });
      codebook.push({
        key: unit.key,
        name: unit.name,
        variables: sortedBookVariables,
        missings: missings
      });
    });

    if (exportFormat === 'docx') {
      return new Promise(resolve => {
        resolve(DownloadDocx.getCodebook(codebook, contentSetting));
      });
    }

    return new Promise(resolve => {
      const data = JSON.stringify(codebook);
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
            unitService.findAllWithMetadata(w.id).then(unitData => {
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
                // eslint-disable-next-line max-len
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
        date = `${wsData.latestChange
          .getDate()}.${wsData.latestChange
          .getMonth() + 1}.${wsData.latestChange
          .getFullYear()}`;
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
    return (await wb.xlsx.writeBuffer()) as Buffer;
  }
}
