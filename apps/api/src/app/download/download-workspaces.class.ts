import * as Excel from 'exceljs';
import {
  UnitMetadataDto,
  CodebookUnitDto,
  CodeBookContentSetting,
  MissingsProfilesDto
} from '@studio-lite-lib/api-dto';
import {
  CodeData, VariableCodingData, ToTextFactory, CodingScheme, CodeAsText
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
  score?: string;
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
    const units = await unitService.findAllWithMetadata(workspaceGroupId);
    const selectedUnits = units.filter(unit => unitList
      .split(',')
      .map((u: string) => parseInt(u, 10))
      .includes(unit.id)
    );
    const codebook: CodebookUnitDto[] = [];
    const profiles = await settingsService.findMissingsProfiles();
    const missings = profiles.length ? this.getProfileMissings(profiles, contentSetting.missingsProfile) : [];

    selectedUnits.forEach((unit: UnitMetadataDto) => {
      DownloadWorkspacesClass.setCodeBookDataForUnit(unit, contentSetting, codebook, missings);
    });

    if (contentSetting.exportFormat === 'docx') {
      return new Promise(resolve => {
        resolve(DownloadDocx.getDocXCodebook(codebook, contentSetting));
      });
    }

    return new Promise(resolve => {
      const data = JSON.stringify(codebook);
      resolve(Buffer.from(data, 'utf-8'));
    });
  }

  private static getProfileMissings(profiles: MissingsProfilesDto[], missingsProfile: string): Missing[] {
    let missings: Missing[] = [];
    try {
      const foundProfile = profiles.find(profile => profile.label === missingsProfile);
      if (foundProfile) {
        missings = JSON.parse(foundProfile.missings);
      }
    } catch {
      missings = [];
    }
    return missings;
  }

  private static isClosed(variableCodingData: VariableCodingData): boolean {
    return variableCodingData.codes.some(codeData => codeData.type === 'RESIDUAL_AUTO');
  }

  private static isManual(variableCodingData: VariableCodingData): boolean {
    return variableCodingData.codes.some(codeData => codeData.manualInstruction);
  }

  private static isManualWithoutClosed(variableCodingData: VariableCodingData): boolean {
    return variableCodingData.codes.some(codeData => codeData.manualInstruction && codeData.type !== 'RESIDUAL_AUTO');
  }

  private static isClosedWithoutManual(variableCodingData: VariableCodingData): boolean {
    return variableCodingData.codes.some(codeData => codeData.type === 'RESIDUAL_AUTO' && !codeData.manualInstruction);
  }

  private static getCodeInfo(code: CodeData, contentSetting: CodeBookContentSetting): CodeInfo {
    const codeInfo: CodeInfo = {
      id: `${code.id}`,
      label: '',
      description:
        '<p>Kodierschema mit Schemer Version ab 1.5 erzeugen!</p>'
    };
    if (contentSetting.showScore) codeInfo.score = '';
    return codeInfo;
  }

  private static getCodeInfoFromCodeAsText(code: CodeData, contentSetting: CodeBookContentSetting): CodeInfo {
    const codeAsText = ToTextFactory.codeAsText(code, 'SIMPLE');
    const rulesDescription = contentSetting.hasOnlyManualCoding && !contentSetting.hasClosedVars ? '' :
      DownloadWorkspacesClass.getRulesDescription(codeAsText, code);
    const codeInfo: CodeInfo = {
      id: `${code.id}`,
      label: contentSetting.codeLabelToUpper ? codeAsText.label.toUpperCase() : codeAsText.label,
      description: `${rulesDescription}${code.manualInstruction}`
    };
    if (contentSetting.showScore) codeInfo.score = codeAsText.score.toString();
    return codeInfo;
  }

  private static getRulesDescription(codeAsText: CodeAsText, code: CodeData): string {
    let rulesDescription = '';
    codeAsText.ruleSetDescriptions.forEach(
      (ruleSetDescription: string) => {
        if (ruleSetDescription !== 'Keine Regeln definiert.') {
          rulesDescription += `<p>${ruleSetDescription}</p>`;
        } else if (code.manualInstruction === '') rulesDescription += `<p>${ruleSetDescription}</p>`;
      }
    );
    return rulesDescription;
  }

  private static setVariableCodingData(
    variableCoding: VariableCodingData,
    contentSetting: CodeBookContentSetting,
    bookVariables: BookVariable[]
  ): void {
    if (variableCoding.codes.length) {
      const codes: CodeInfo[] = [];
      variableCoding.codes.forEach(code => {
        // Catch schemer version <1.5
        if (!Object.prototype.hasOwnProperty.call(code, 'rules')) {
          codes.push(DownloadWorkspacesClass.getCodeInfoFromCodeAsText(code, contentSetting));
        } else {
          codes.push(DownloadWorkspacesClass.getCodeInfo(code, contentSetting));
        }
      });
      const isDerived: boolean = variableCoding.sourceType !== 'BASE';
      if (!isDerived) {
        DownloadWorkspacesClass.setBookVariable(contentSetting, codes, bookVariables, variableCoding);
      } else if (contentSetting.hasDerivedVars) {
        DownloadWorkspacesClass.setBookVariable(contentSetting, codes, bookVariables, variableCoding);
      }
    }
  }

  private static setBookVariable(contentSetting: CodeBookContentSetting,
                                 codes: CodeInfo[],
                                 bookVariables: BookVariable[],
                                 variableCoding: VariableCodingData
  ): void {
    const codingVar = {
      closed: DownloadWorkspacesClass.isClosed(variableCoding),
      manual: DownloadWorkspacesClass.isManual(variableCoding),
      isManualWithoutClosed: DownloadWorkspacesClass.isManualWithoutClosed(variableCoding),
      isClosedWithoutManual: DownloadWorkspacesClass.isClosedWithoutManual(variableCoding)
    };
    if (codingVar.closed && contentSetting.hasClosedVars) {
      DownloadWorkspacesClass.addBookVariable(contentSetting, codes, bookVariables, variableCoding);
    } else if (
      codingVar.isManualWithoutClosed && contentSetting.hasOnlyManualCoding && !contentSetting.hasClosedVars
    ) {
      DownloadWorkspacesClass.addBookVariable(contentSetting, codes, bookVariables, variableCoding);
    } else if (codingVar.manual && contentSetting.hasOnlyManualCoding && contentSetting.hasClosedVars) {
      DownloadWorkspacesClass.addBookVariable(contentSetting, codes, bookVariables, variableCoding);
    }
  }

  private static addBookVariable(
    contentSetting: CodeBookContentSetting,
    codes: CodeInfo[],
    bookVariables: BookVariable[],
    variableCoding: VariableCodingData
  ): void {
    bookVariables.push({
      id: variableCoding.id,
      label: variableCoding.label,
      generalInstruction: contentSetting.hasGeneralInstructions ?
        variableCoding.manualInstruction :
        '',
      codes: codes
    });
  }

  private static setCodeBookDataForUnit(
    unit: UnitMetadataDto, contentSetting: CodeBookContentSetting,
    codebook: CodebookUnitDto[],
    missings: Missing[]
  ): void {
    const parsedScheme = new CodingScheme(unit.scheme);
    const bookVariables: Array<BookVariable> = [];

    if (parsedScheme?.variableCodings) {
      parsedScheme?.variableCodings.forEach(
        (variableCoding: VariableCodingData) => {
          DownloadWorkspacesClass.setVariableCodingData(variableCoding, contentSetting, bookVariables);
        }
      );
    }
    codebook.push({
      key: unit.key,
      name: unit.name,
      variables: DownloadWorkspacesClass.getSortedBookVariables(bookVariables),
      missings: missings
    });
  }

  private static getSortedBookVariables(bookVariables: BookVariable[]): BookVariable[] {
    return bookVariables.sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
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
