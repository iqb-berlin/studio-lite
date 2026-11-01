import { createMock } from '@golevelup/ts-jest';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import Excel from 'exceljs';
import { BadRequestException } from '@nestjs/common';
import {
  UnitPropertiesDto,
  CodeBookContentSetting,
  WorkspaceGroupDto
} from '@studio-lite-lib/api-dto';
import type { UnitService } from '../services/unit.service';
import type { SettingService } from '../services/setting.service';
import type { WorkspaceService } from '../services/workspace.service';
import { DownloadWorkspacesClass } from './download-workspaces.class';

// The first sheet as a reader of the file sees it: its name, and the values of each row, header
// first. An empty cell reads as ''.
const readSheet = async (file: Buffer): Promise<{ name: string; rows: unknown[][] }> => {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(file as unknown as Excel.Buffer);
  const [sheet] = workbook.worksheets;
  const rows: unknown[][] = [];
  sheet.eachRow(row => rows.push(
    Array.from({ length: sheet.columnCount }, (_, i) => row.getCell(i + 1).value ?? '')
  ));
  return { name: sheet.name, rows };
};

describe('DownloadWorkspacesClass', () => {
  // A unit U1 with one profile; order 0 marks it as the profile the workspace uses.
  const unitWithProfile = (entries: object[], order = 0) => ({
    id: 1, key: 'U1', metadata: { profiles: [{ order, entries }] }
  }) as unknown as UnitPropertiesDto;

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

    it('should list an item without the current profile with what the item itself says', () => {
      const units = [{
        key: 'U1',
        metadata: {
          items: [{
            id: 'I1', variableId: 'V1', description: 'Notiz', profiles: [{ order: -1, entries: [] }]
          }]
        }
      }] as unknown as UnitPropertiesDto[];

      expect(DownloadWorkspacesClass.setUnitsItemsDataRows(units)).toEqual([{
        Aufgabe: 'U1', 'Item-Id': 'I1', Variable: 'V1', Notiz: 'Notiz'
      }]);
    });

    it('should write an empty cell for an entry without value', () => {
      const units = [{
        key: 'U1',
        metadata: {
          items: [{
            id: 'I1', profiles: [{ order: 0, entries: [{ label: [{ value: 'Thema' }], valueAsText: [] }] }]
          }]
        }
      }] as unknown as UnitPropertiesDto[];

      expect(DownloadWorkspacesClass.setUnitsItemsDataRows(units)[0].Thema).toBe('');
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

    it.each([
      ['several values joined by commas', [{ value: 'a' }, { value: 'b' }], 'a, b'],
      ['a single value given as an object', { value: 'c' }, 'c'],
      ['an empty cell for no value', [], '']
    ])('should write %s', (_, valueAsText, cell) => {
      const [row] = DownloadWorkspacesClass.setUnitsDataRows([
        unitWithProfile([{ label: [{ value: 'Fach' }], valueAsText }])
      ]);

      expect(row.Fach).toBe(cell);
    });

    // Only the profile the workspace uses counts; a unit without it is still listed.
    it('should list a unit without the current profile by its key alone', () => {
      expect(DownloadWorkspacesClass.setUnitsDataRows([
        unitWithProfile([{ label: [{ value: 'Fach' }], valueAsText: [{ value: 'x' }] }], -1)
      ])).toEqual([{ Aufgabe: 'U1' }]);
    });
  });

  describe('getWorkspaceMetadataReport', () => {
    const unitService = createMock<UnitService>();
    const entry = (label: string, value: string) => ({ label: [{ value: label }], valueAsText: [{ value }] });

    beforeEach(() => {
      unitService.findAllWithProperties.mockResolvedValue([1, 2].map(id => ({
        id,
        key: `U${id}`,
        metadata: {
          profiles: [{ order: 0, entries: [entry('Fach', 'Mathe')] }],
          items: [{
            id: `I${id}`,
            variableId: 'V1',
            description: 'N',
            profiles: [{ order: 0, entries: [entry('Thema', 'Bruch')] }]
          }]
        }
      })) as unknown as UnitPropertiesDto[]);
    });

    it('should write the units chosen, under the names a reader knows the columns by', async () => {
      const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
        'unit', unitService, 1, ['key', 'Fach'], [2]
      );

      expect(await readSheet(file)).toEqual({
        name: 'Aufgaben Metadaten ',
        rows: [['Aufgabe', 'Fach'], ['U2', 'Mathe']]
      });
    });

    it('should write a row per item of the units chosen for the item report', async () => {
      const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
        'item', unitService, 1, ['key', 'id', 'variableId', 'description', 'Thema'], [1]
      );

      expect(await readSheet(file)).toEqual({
        name: ' Items Metadaten ',
        rows: [['Aufgabe', 'Item-Id', 'Variable', 'Notiz', 'Thema'], ['U1', 'I1', 'V1', 'N', 'Bruch']]
      });
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

    it.each([false, true])('retains code and general text around failed inline images, score=%p', async showScore => {
      const instruction = '<p><strong>VOR</strong><img src="data:image/png;base64,YQ==">' +
        '<span style="color:#ff0000">NACH</span></p><p>WEITER</p>';
      const units = createMock<UnitService>();
      const settings = createMock<SettingService>();
      const parsed = JSON.parse(scheme);
      parsed.variableCodings[0].manualInstruction = instruction;
      parsed.variableCodings[0].codes[0].manualInstruction = instruction;
      units.findAllWithProperties.mockResolvedValue([{
        id: 1, key: 'U', name: 'Unit', scheme: JSON.stringify(parsed), metadata: { items: [] }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([]);
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1, units, settings, { ...options, exportFormat: 'docx', showScore }, [1]
      );
      const $ = load(new AdmZip(result).readAsText('word/document.xml'), { xml: true });
      const paragraphs = $('w\\:p').toArray().filter(paragraph => $(paragraph).find('w\\:t').text().startsWith('VOR'));
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs.map(paragraph => $(paragraph).find('w\\:t').text())).toEqual([
        'VORHTML konnte nicht verarbeitet werden.NACH', 'VORHTML konnte nicht verarbeitet werden.NACH'
      ]);
      paragraphs.forEach(paragraph => {
        expect($(paragraph).find('w\\:b')).toHaveLength(1);
        expect($(paragraph).find('w\\:color[w\\:val="FF0000"]')).toHaveLength(1);
      });
      expect($('w\\:t').toArray().filter(node => $(node).text() === 'WEITER')).toHaveLength(2);
    });

    // The metadata names the variable by its id; the codebook shows its alias.
    it('names the items by the alias of their variable and leaves out those without id or variable', async () => {
      const units = createMock<UnitService>();
      const settings = createMock<SettingService>();
      const parsed = JSON.parse(scheme);
      parsed.variableCodings[0].alias = 'A';
      units.findAllWithProperties.mockResolvedValue([{
        id: 1,
        key: 'U',
        name: 'Unit',
        scheme: JSON.stringify(parsed),
        metadata: {
          items: [{ id: 'I1', variableId: 'V' }, { id: '', variableId: 'V' }, { id: 'I3' }]
        }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([]);

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1, units, settings, { ...options, exportFormat: 'docx' }, [1]
      );

      const $ = load(new AdmZip(result).readAsText('word/document.xml'), { xml: true });
      expect($('w\\:p').toArray()
        .map(paragraph => $(paragraph).find('w\\:t').text())
        .filter(text => text.startsWith('Item(s):'))).toEqual(['Item(s): I1   ']);
    });

    it('refuses a unit whose scheme cannot be read, naming the unit', async () => {
      const units = createMock<UnitService>();
      const settings = createMock<SettingService>();
      units.findAllWithProperties.mockResolvedValue([{
        id: 1, key: 'KAPUTT', name: 'Unit', scheme: '{kein json', metadata: { items: [] }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([]);

      const codebook = DownloadWorkspacesClass.getWorkspaceCodingBook(1, units, settings, options, [1]);

      await expect(codebook).rejects.toThrow(BadRequestException);
      await expect(codebook).rejects.toThrow(/KAPUTT/);
    });

    it.each([
      ['a profile of another name', { label: 'Anders', missings: JSON.stringify([{ code: 0, label: 'M' }]) }],
      ['a profile whose missings cannot be read', { label: 'Profil', missings: '{kaputt' }]
    ])('writes no missings for %s', async (_, profile) => {
      const units = createMock<UnitService>();
      const settings = createMock<SettingService>();
      units.findAllWithProperties.mockResolvedValue([{
        id: 1, key: 'U', name: 'Unit', scheme, metadata: { items: [] }
      }] as UnitPropertiesDto[]);
      settings.findMissingsProfiles.mockResolvedValue([{ id: 8, ...profile }]);

      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(1, units, settings, options, [1]);

      expect(JSON.parse(result.toString())[0].missings).toEqual([]);
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
    const workspaceService = createMock<WorkspaceService>();
    const unitService = createMock<UnitService>();
    const module = (editor: string) => ({
      editor, player: 'P', schemer: 'S', lastChangedMetadata: null, lastChangedDefinition: null, lastChangedScheme: null
    });

    beforeEach(() => {
      workspaceService.findAllGroupwise.mockResolvedValue([
        { id: 1, name: 'G1', workspaces: [{ id: 10, name: 'WS10' }, { id: 11, name: 'WS11' }] },
        { id: 2, name: 'G2', workspaces: [{ id: 20, name: 'WS20' }] }
      ] as unknown as WorkspaceGroupDto[]);
      unitService.findAllWithProperties.mockImplementation(async workspaceId => (
        workspaceId === 10 ? [module('E'), module('E'), module('')] : []
      ) as unknown as UnitPropertiesDto[]);
    });

    // A column per module in use; a unit without one is counted under "none".
    it('should count the units of each workspace per module and leave a module it does not use blank', async () => {
      const { name, rows } = await readSheet(await DownloadWorkspacesClass.getWorkspaceReport(
        workspaceService, unitService, 1
      ));

      expect(name).toBe('Arbeitsbereiche');
      expect(rows).toEqual([
        ['Gruppe Name', 'Gruppe Id', 'Arbeitsbereich Name', 'Arbeitsbereich Id', 'Letzte Änderung', 'Anzahl Units',
          'E', 'Kein Editor', 'P', 'S'],
        ['G1', 1, 'WS10', 10, '', 3, 2, 1, 3, 3],
        ['G1', 1, 'WS11', 11, '', 0, '', '', '', '']
      ]);
    });

    it('should report every group when none is chosen', async () => {
      const { rows } = await readSheet(await DownloadWorkspacesClass.getWorkspaceReport(
        workspaceService, unitService, 0
      ));

      expect(rows.slice(1).map(row => row[3])).toEqual([10, 11, 20]);
    });

    // The units come sorted by key; the column showed the change of the last one (#1983).
    it('should show the newest change of any unit as the latest change of the workspace', async () => {
      unitService.findAllWithProperties.mockImplementation(async workspaceId => (workspaceId === 10 ? [
        {
          ...module('E'),
          key: 'A1',
          lastChangedMetadata: new Date(2026, 9, 1, 12),
          lastChangedScheme: new Date(2026, 9, 30, 12)
        },
        { ...module('E'), key: 'Z9', lastChangedMetadata: new Date(2022, 4, 3, 12) }
      ] : []) as unknown as UnitPropertiesDto[]);

      const { rows } = await readSheet(await DownloadWorkspacesClass.getWorkspaceReport(
        workspaceService, unitService, 1
      ));

      expect(rows[1][4]).toBe('30.10.2026');
    });

    // The API runs in UTC; a change shortly after midnight in German time showed the day before (#2082).
    it.each([
      ['winter', Date.UTC(2026, 9, 29, 23, 30), '30.10.2026'],
      ['summer', Date.UTC(2026, 4, 2, 22, 30), '3.5.2026']
    ])('should show the day of the latest change in German time in %s', async (_, changed, day) => {
      unitService.findAllWithProperties.mockImplementation(async workspaceId => (workspaceId === 10 ? [
        { ...module('E'), lastChangedMetadata: new Date(changed) }
      ] : []) as unknown as UnitPropertiesDto[]);

      const { rows } = await readSheet(await DownloadWorkspacesClass.getWorkspaceReport(
        workspaceService, unitService, 1
      ));

      expect(rows[1][4]).toBe(day);
    });
  });
});
