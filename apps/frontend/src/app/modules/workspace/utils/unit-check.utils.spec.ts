import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import {
  checkUnit, storesToCheck, UnitCheckInput, UnitCheckSection
} from './unit-check.utils';

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

const okInput = (): UnitCheckInput => ({
  modules: { editor: 'iqb-editor-aspect@2.9', player: 'iqb-player-aspect@2.9', schemer: 'iqb-schemer@2.5' },
  installed: {
    editor: { 'iqb-editor-aspect@2.9': { nameAndVersion: 'Aspect Editor 2.9' } },
    player: {
      'iqb-player-aspect@2.9': {
        nameAndVersion: 'Aspect Player 2.9',
        metadata: { model: 'aspect-unit-definition@>=4.0 <=4.12' }
      }
    },
    schemer: { 'iqb-schemer@2.5': { nameAndVersion: 'Schemer 2.5' } }
  },
  definition: {
    definition: '{"pages":[]}',
    definitionType: 'aspect-unit-definition@4.10.0',
    variables: [{ id: 'text_1', alias: 'text_1' } as VariableInfo]
  },
  scheme: { scheme: scheme([{ id: 'text_1', sourceType: 'BASE' }]), schemeType: 'iqb-standard@3.0' },
  hasComments: false,
  hasRichNotes: true,
  hiddenRoutes: []
});

const section = (sections: UnitCheckSection[], tab: UnitCheckSection['tab']): UnitCheckSection | undefined => sections
  .find(entry => entry.tab === tab);

describe('checkUnit', () => {
  it('finds nothing wrong with a complete unit', () => {
    const sections = checkUnit(okInput());

    expect(sections.map(entry => entry.tab)).toEqual(['properties', 'editor', 'schemer', 'comments', 'notes']);
    expect(sections.every(entry => entry.ok)).toBe(true);
  });

  describe('properties', () => {
    it('names a module the unit does not name', () => {
      const input = okInput();
      input.modules = { ...input.modules, schemer: '' };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.no-schemer' }]);
    });

    it('says so when the properties could not be loaded', () => {
      const input = okInput();
      input.modules = undefined;

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.not-loaded' }]);
    });

    it('names a module that is not installed', () => {
      const input = okInput();
      input.modules = { ...input.modules, player: 'iqb-player-aspect@1.4' };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{
        key: 'unit-check.not-installed-player', params: { module: 'iqb-player-aspect@1.4' }
      }]);
    });

    it('takes a later minor version as installed, as the module is opened with it', () => {
      const input = okInput();
      input.modules = { ...input.modules, editor: 'iqb-editor-aspect@2.7' };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([]);
    });
  });

  describe('editor', () => {
    it('names a unit without content', () => {
      const input = okInput();
      input.definition = { definition: '', variables: [] };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{ key: 'unit-check.no-definition' }]);
    });

    it('names a format the player says it does not read', () => {
      const input = okInput();
      input.definition = { ...input.definition, definitionType: 'aspect-unit-definition@5.0.0' };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{
        key: 'workspace.definition-type-incompatible',
        params: { player: 'Aspect Player 2.9', definitionType: 'aspect-unit-definition@5.0.0' }
      }]);
    });

    it('finds no fault where the format is unknown', () => {
      const input = okInput();
      input.definition = { ...input.definition, definitionType: undefined };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([]);
    });

    it('says so when the definition could not be loaded', () => {
      const input = okInput();
      input.definition = undefined;

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{ key: 'unit-check.not-loaded' }]);
    });
  });

  describe('schemer', () => {
    it('names a unit without coding scheme', () => {
      const input = okInput();
      input.scheme = { scheme: '', schemeType: '' };

      expect(section(checkUnit(input), 'schemer')?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);
    });

    it('lists the ids the export would write twice, from the variables as they are edited (#2119)', () => {
      const input = okInput();
      input.definition = { ...input.definition, variables: [{ id: '05', alias: '_00a' } as VariableInfo] };
      input.scheme = {
        scheme: scheme([{ id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL' }]),
        schemeType: 'iqb-standard@3.0'
      };

      const schemer = section(checkUnit(input), 'schemer');
      expect(schemer?.ok).toBe(false);
      expect(schemer?.variableIdConflicts).toEqual([{
        id: '05',
        variables: [
          { kind: 'base', id: '05', alias: '_00a' },
          { kind: 'derived', id: 'd_1790938214783', alias: '05' }
        ]
      }]);
    });

    // a conflict with an element needs its variables, and the check must not pass without them
    it('does not report the coding in order when the variables could not be loaded', () => {
      const input = okInput();
      input.definition = undefined;
      input.scheme = {
        scheme: scheme([{ id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL' }]),
        schemeType: 'iqb-standard@3.0'
      };

      expect(section(checkUnit(input), 'schemer')).toEqual(expect.objectContaining({
        ok: false, findings: [{ key: 'unit-check.variables-not-loaded' }]
      }));
    });
  });

  describe('comments and rich notes', () => {
    it('tells whether there are any, without counting it as a finding', () => {
      const sections = checkUnit(okInput());

      expect(section(sections, 'comments'))
        .toEqual(expect.objectContaining({ ok: true, info: { key: 'unit-check.comments-absent' } }));
      expect(section(sections, 'notes'))
        .toEqual(expect.objectContaining({ ok: true, info: { key: 'unit-check.notes-present' } }));
    });

    it('says so when it is not known', () => {
      const input = okInput();
      input.hasRichNotes = undefined;

      expect(section(checkUnit(input), 'notes')?.info).toEqual({ key: 'unit-check.not-loaded' });
    });

    it('leaves out the tabs the workspace hides', () => {
      const input = okInput();
      input.hiddenRoutes = ['comments', 'notes'];

      expect(checkUnit(input).map(entry => entry.tab)).toEqual(['properties', 'editor', 'schemer']);
    });
  });

  describe('hidden editor and coding', () => {
    // a finding in a tab the workspace hides could not be resolved there
    it('checks neither the tabs nor their modules', () => {
      const input = okInput();
      input.hiddenRoutes = ['editor', 'schemer'];
      input.modules = { player: 'iqb-player-aspect@2.9' };
      // neither is loaded then
      input.definition = undefined;
      input.scheme = undefined;

      const sections = checkUnit(input);

      expect(sections.map(entry => entry.tab)).toEqual(['properties', 'comments', 'notes']);
      expect(section(sections, 'properties')?.findings).toEqual([]);
    });

    // the coding's ids are checked against the variables of the definition
    it('loads the definition for a shown coding also when the editor is hidden', () => {
      expect(storesToCheck(['editor'])).toEqual({ definition: true, scheme: true });
      expect(storesToCheck(['schemer'])).toEqual({ definition: true, scheme: false });
      expect(storesToCheck(['editor', 'schemer'])).toEqual({ definition: false, scheme: false });
    });

    it('still names a missing player, which the export needs whether the preview is shown or not', () => {
      const input = okInput();
      input.hiddenRoutes = ['preview', 'editor', 'schemer'];
      input.modules = {};

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.no-player' }]);
    });
  });
});
