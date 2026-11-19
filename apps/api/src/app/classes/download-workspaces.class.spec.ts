import { createMock } from '@golevelup/ts-jest';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import { BadRequestException } from '@nestjs/common';
import {
  UnitPropertiesDto,
  CodeBookContentSetting
} from '@studio-lite-lib/api-dto';
import type { UnitService } from '../services/unit.service';
import type { SettingService } from '../services/setting.service';
import { DownloadWorkspacesClass } from './download-workspaces.class';

describe('DownloadWorkspacesClass', () => {
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
      settings.findMissingsProfiles.mockResolvedValue([{
        id: 8, label: 'Profil', missings: JSON.stringify([{ code: 0, label: 'Missing', description: 'Leer' }])
      }]);
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
      const result = await DownloadWorkspacesClass.getWorkspaceCodingBook(
        1,
        units,
        settings,
        { ...options, exportFormat: 'docx' },
        []
      );
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.subarray(0, 2).toString()).toBe('PK');
    });
  });
});
