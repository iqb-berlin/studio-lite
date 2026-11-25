import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import {
  checkUnit, definitionSummary, UnitCheckInput, UnitCheckSection, withKeyFindings
} from './unit-check.utils';

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

// a code, so that the schemer finds nothing missing in a coding
const code = {
  id: 1,
  type: 'FULL_CREDIT',
  label: '',
  score: 1,
  ruleSetOperatorAnd: false,
  manualInstruction: '',
  ruleSets: [{ ruleOperatorAnd: false, rules: [{ method: 'IS_EMPTY' }] }]
};

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
  definition: { hasDefinition: true, definitionType: 'aspect-unit-definition@4.10.0' },
  variables: [{ id: 'text_1', alias: 'text_1' } as VariableInfo],
  scheme: {
    scheme: scheme([{ id: 'text_1', sourceType: 'BASE', codes: [code] }]),
    schemeType: 'iqb-standard@3.0'
  },
  unsaved: { variables: false },
  hasComments: false,
  hasRichNotes: true,
  hiddenRoutes: []
});

// two elements of the same name, as when they were copied from another page with it (#2135)
const nameTwiceInput = (): UnitCheckInput => {
  const input = okInput();
  input.variables = [
    { id: 'text_1749756922777_1', alias: 'text_1', type: 'no-value' } as VariableInfo,
    { id: 'text_1749757116310_1', alias: 'text_1', type: 'no-value' } as VariableInfo
  ];
  input.scheme = {
    scheme: scheme([
      { id: 'text_1749756922777_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_1749757116310_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ]),
    schemeType: 'iqb-standard@3.0'
  };
  return input;
};

const section = (sections: UnitCheckSection[], tab: UnitCheckSection['tab']): UnitCheckSection | undefined => sections
  .find(entry => entry.tab === tab);

describe('checkUnit', () => {
  it('finds nothing wrong with a complete unit', () => {
    const sections = checkUnit(okInput());

    expect(sections.map(entry => entry.tab)).toEqual(['properties', 'editor', 'schemer', 'comments', 'notes']);
    // nothing fails anywhere; comments and rich notes are information, not a pass
    expect(sections.map(entry => entry.status)).toEqual(['ok', 'ok', 'ok', 'info', 'info']);
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

    // a failed request for the lists is no proof that a module is missing (#2135)
    it('says the modules were not checked when their lists could not be loaded', () => {
      const input = okInput();
      input.installed = undefined;
      input.modules = { ...input.modules, schemer: undefined };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([
        { key: 'unit-check.modules-not-loaded' }, { key: 'unit-check.no-schemer' }
      ]);
    });

    it('takes a later minor version as installed, as the module is opened with it', () => {
      const input = okInput();
      input.modules = { ...input.modules, editor: 'iqb-editor-aspect@2.7' };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([]);
    });

    // without its editor a unit cannot be edited, but preview, export and coding work all the same
    it('names a missing or uninstalled editor as a hint, and the properties as in order', () => {
      const input = okInput();
      input.modules = { ...input.modules, editor: '' };
      expect(section(checkUnit(input), 'properties')).toEqual(expect.objectContaining({
        findings: [{ key: 'unit-check.no-editor', hint: true }], status: 'info'
      }));

      input.modules = { ...input.modules, editor: 'iqb-editor-other@1.0' };
      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{
        key: 'unit-check.not-installed-editor', params: { module: 'iqb-editor-other@1.0' }, hint: true
      }]);
    });

    it('shows a missing player as a problem, hints beside it or not', () => {
      const input = okInput();
      input.modules = { editor: '', player: '', schemer: input.modules?.schemer };

      expect(section(checkUnit(input), 'properties')).toEqual(expect.objectContaining({
        findings: [{ key: 'unit-check.no-editor', hint: true }, { key: 'unit-check.no-player' }],
        status: 'warning'
      }));
    });
  });

  describe('editor', () => {
    // the request for the lists failed: no finding would pass for a format the player reads (#2135)
    it('says the format was not checked when the lists of modules could not be loaded', () => {
      const input = okInput();
      input.installed = undefined;

      expect(section(checkUnit(input), 'editor')?.findings)
        .toEqual([{ key: 'unit-check.definition-type-not-checked' }]);
    });

    it('does not say so for a unit that names no format, as there would be nothing to check', () => {
      const input = okInput();
      input.installed = undefined;
      input.definition = { hasDefinition: true, definitionType: undefined };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([]);
    });

    it('names a unit without content', () => {
      const input = okInput();
      input.definition = { hasDefinition: false };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{ key: 'unit-check.no-definition' }]);
    });

    it('names a format the player says it does not read', () => {
      const input = okInput();
      input.definition = { hasDefinition: true, definitionType: 'aspect-unit-definition@5.0.0' };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{
        key: 'workspace.definition-type-incompatible',
        params: { player: 'Aspect Player 2.9', definitionType: 'aspect-unit-definition@5.0.0' }
      }]);
    });

    it('finds no fault where the format is unknown', () => {
      const input = okInput();
      input.definition = { hasDefinition: true, definitionType: undefined };

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([]);
    });

    it('says so when the definition could not be loaded', () => {
      const input = okInput();
      input.definition = undefined;

      expect(section(checkUnit(input), 'editor')?.findings).toEqual([{ key: 'unit-check.definition-not-loaded' }]);
    });
  });

  describe('schemer', () => {
    it('names a unit without coding scheme', () => {
      const input = okInput();
      input.scheme = { scheme: '', schemeType: '' };

      expect(section(checkUnit(input), 'schemer')?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);
    });

    // the export dialog warns of them, scheme or not; the card has to say the same
    it('lists two elements of one internal id in a unit without coding scheme', () => {
      const input = okInput();
      input.scheme = { scheme: '', schemeType: '' };
      input.variables = [
        { id: 'text_x', alias: 'text_1' } as VariableInfo, { id: 'text_x', alias: 'text_2' } as VariableInfo
      ];

      const schemer = section(checkUnit(input), 'schemer');
      expect(schemer?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);
      expect(schemer?.variableIdConflicts.map(conflict => conflict.id)).toEqual(['text_x']);
    });

    describe('a unit with nothing to code', () => {
      // an information unit: texts and images only, which aspect reports as elements without value
      const infoInput = (): UnitCheckInput => {
        const input = okInput();
        input.modules = { ...input.modules, schemer: '' };
        input.scheme = { scheme: '', schemeType: '' };
        // in the spelling of VariableInfo 1.x and of 2.0
        input.variables = [
          { id: 'text_1', alias: 'text_1', type: 'no-value' } as VariableInfo,
          { id: 'image_1', alias: 'image_1', type: 'NO_VALUE' } as unknown as VariableInfo
        ];
        return input;
      };

      it('needs no scheme and no schemer, and says there is nothing to code', () => {
        const sections = checkUnit(infoInput());

        expect(section(sections, 'schemer')).toEqual(expect.objectContaining({
          findings: [], info: { key: 'unit-check.nothing-to-code' }, status: 'info'
        }));
        expect(section(sections, 'properties')?.findings).toEqual([]);
      });

      // the export writes the elements all the same
      it('still lists two elements of one internal id', () => {
        const input = infoInput();
        input.variables = [
          { id: 'text_x', alias: 'text_1', type: 'no-value' } as VariableInfo,
          { id: 'text_x', alias: 'text_2', type: 'no-value' } as VariableInfo
        ];

        const schemer = section(checkUnit(input), 'schemer');
        expect(schemer).toEqual(expect.objectContaining({ status: 'warning' }));
        expect(schemer?.variableIdConflicts.map(conflict => conflict.id)).toEqual(['text_x']);
      });

      it('is not one where an element has a value', () => {
        const input = infoInput();
        input.variables = [
          ...input.variables ?? [],
          { id: 'text_field_1', alias: 'name', type: 'string' } as VariableInfo
        ];
        const sections = checkUnit(input);

        expect(section(sections, 'schemer')?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);
        expect(section(sections, 'properties')?.findings).toEqual([{ key: 'unit-check.no-schemer' }]);
      });

      // a new unit has no elements yet: nothing says it is an information unit
      it('is not one without any elements', () => {
        const input = infoInput();
        input.variables = [];
        const sections = checkUnit(input);

        expect(section(sections, 'schemer')?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);
        expect(section(sections, 'properties')?.findings).toEqual([{ key: 'unit-check.no-schemer' }]);
      });

      // what is not known is not nothing: without the variables, or without the scheme, which may exist
      it('is not one while the variables or the scheme are not known', () => {
        const withoutVariables = infoInput();
        withoutVariables.variables = undefined;
        expect(section(checkUnit(withoutVariables), 'schemer')?.findings).toEqual([{ key: 'unit-check.no-scheme' }]);

        const withoutScheme = infoInput();
        withoutScheme.scheme = undefined;
        expect(section(checkUnit(withoutScheme), 'properties')?.findings).toEqual([{ key: 'unit-check.no-schemer' }]);
      });

      // the scheme of an information unit is checked as any other: it may derive variables
      it('is not one once it has a scheme', () => {
        const input = infoInput();
        input.scheme = {
          scheme: scheme([{ id: 'text_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }]),
          schemeType: 'iqb-standard@3.0'
        };

        expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.no-schemer' }]);
        expect(section(checkUnit(input), 'schemer')?.info).toBeUndefined();
      });
    });

    it('lists the ids the export would write twice, from the variables as they are edited (#2119)', () => {
      const input = okInput();
      input.variables = [{ id: '05', alias: '_00a' } as VariableInfo];
      input.scheme = {
        scheme: scheme([{ id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL' }]),
        schemeType: 'iqb-standard@3.0'
      };

      const schemer = section(checkUnit(input), 'schemer');
      expect(schemer?.status).toBe('warning');
      expect(schemer?.variableIdConflicts).toEqual([{
        id: '05',
        variables: [
          { kind: 'base', id: '05', alias: '_00a' },
          { kind: 'derived', id: 'd_1790938214783', alias: '05' }
        ]
      }]);
    });

    it('names what the schemer finds wrong with the coding, with how to fix it (#2135)', () => {
      const input = okInput();
      input.scheme = {
        scheme: scheme([
          { id: 'text_1', sourceType: 'BASE', codes: [code] },
          {
            id: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['text_1', 'gone'], codes: [code]
          }
        ]),
        schemeType: 'iqb-standard@3.0'
      };

      const schemer = section(checkUnit(input), 'schemer');
      expect(schemer?.status).toBe('warning');
      expect(schemer?.findings).toEqual([
        { key: 'unit-check.scheme-problem.SOURCE_MISSING', params: { variable: 'sum' } }
      ]);
    });

    // where it is fixed: elements copied with their names are renamed in the editor (#2135)
    it('names what the schemer finds wrong with an element under the editor, and the coding in order', () => {
      const sections = checkUnit(nameTwiceInput());

      expect(section(sections, 'editor')).toEqual(expect.objectContaining({
        status: 'warning',
        findings: [{ key: 'unit-check.element-problem.NAME_TWICE', params: { variable: 'text_1' } }]
      }));
      expect(section(sections, 'schemer')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
    });

    // one of two elements of the same name renamed in the editor; the scheme holds the old name
    const renamedInput = (): UnitCheckInput => {
      const input = nameTwiceInput();
      input.variables = [
        { id: 'text_1749756922777_1', alias: 'text_1', type: 'no-value' } as VariableInfo,
        { id: 'text_1749757116310_1', alias: 'text_2', type: 'no-value' } as VariableInfo
      ];
      return input;
    };
    const nameTwice = [{ key: 'unit-check.element-problem.NAME_TWICE', params: { variable: 'text_1' } }];

    // the save renames the coding with the element (#2135)
    it('finds nothing wrong once one of two elements of the same name is renamed, before the save', () => {
      const input = renamedInput();
      input.unsaved = { variables: true };

      expect(section(checkUnit(input), 'editor')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
    });

    // the save drops the coding of an element without value with it (#2135)
    it('finds nothing wrong once an element without value is deleted, before the save', () => {
      const input = nameTwiceInput();
      input.variables = [{ id: 'text_1749756922777_1', alias: 'text_1', type: 'no-value' } as VariableInfo];
      input.unsaved = { variables: true };
      const sections = checkUnit(input);

      expect(section(sections, 'editor')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
      expect(section(sections, 'schemer')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
    });

    // as an import stores it: the definition before the scheme, which keeps its names until a save
    it('checks the coding as it is stored when the variables are saved', () => {
      expect(section(checkUnit(renamedInput()), 'editor')?.findings).toEqual(nameTwice);
    });
  });

  // the editor's definition, unsaved changes included, read as the server reads a stored one (#2135)
  describe('definitionSummary', () => {
    it('tells whether the editor holds content, and its format', () => {
      expect(definitionSummary({ definition: '{"pages":[]}', definitionType: 'aspect-unit-definition@4.10.0' }))
        .toEqual({ hasDefinition: true, definitionType: 'aspect-unit-definition@4.10.0' });
      expect(definitionSummary({ definition: '', variables: [] })).toEqual({ hasDefinition: false });
    });
  });

  describe('comments and rich notes', () => {
    it('tells whether there are any, without counting it as a finding', () => {
      const sections = checkUnit(okInput());

      expect(section(sections, 'comments'))
        .toEqual(expect.objectContaining({ status: 'info', info: { key: 'unit-check.comments-absent' } }));
      expect(section(sections, 'notes'))
        .toEqual(expect.objectContaining({ status: 'info', info: { key: 'unit-check.notes-present' } }));
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
    // a module opened only in a hidden tab is not needed, nor is a scheme where nobody codes
    it('gives the hidden tabs no section and does not ask for their modules or a scheme', () => {
      const input = okInput();
      input.hiddenRoutes = ['editor', 'schemer'];
      input.modules = { player: 'iqb-player-aspect@2.9' };
      input.scheme = { scheme: '', schemeType: '' };

      const sections = checkUnit(input);

      expect(sections.map(entry => entry.tab)).toEqual(['properties', 'comments', 'notes']);
      expect(section(sections, 'properties')?.status).toBe('ok');
    });

    // the preview and the export play the content whether the editor is shown or not
    it('names content the player cannot play under the properties when the editor is hidden', () => {
      const input = okInput();
      input.hiddenRoutes = ['editor'];
      input.definition = { hasDefinition: true, definitionType: 'aspect-unit-definition@5.0.0' };

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{
        key: 'workspace.definition-type-incompatible',
        params: { player: 'Aspect Player 2.9', definitionType: 'aspect-unit-definition@5.0.0' }
      }]);
    });

    // a scheme may come with an import, and the export writes its ids all the same (#2119)
    it('names an id the export would write twice under the properties when the coding is hidden', () => {
      const input = okInput();
      input.hiddenRoutes = ['schemer'];
      input.variables = [{ id: '05', alias: '_00a' } as VariableInfo];
      input.scheme = {
        scheme: scheme([{ id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL' }]),
        schemeType: 'iqb-standard@3.0'
      };

      const properties = section(checkUnit(input), 'properties');
      expect(properties?.status).toBe('warning');
      expect(properties?.variableIdConflicts.map(conflict => conflict.id)).toEqual(['05']);
    });

    // it is fixed in the coding, and unlike a doubled id it does not stop the export
    it('leaves what the schemer finds wrong to the coding when the coding is hidden', () => {
      const input = nameTwiceInput();
      input.hiddenRoutes = ['schemer'];
      const sections = checkUnit(input);

      expect(section(sections, 'properties')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
      expect(section(sections, 'editor')).toEqual(expect.objectContaining({ status: 'ok', findings: [] }));
    });

    it('names what the schemer finds wrong with an element under the coding when the editor is hidden', () => {
      const input = nameTwiceInput();
      input.hiddenRoutes = ['editor'];

      expect(section(checkUnit(input), 'schemer')?.findings).toEqual([
        { key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' } }
      ]);
    });

    it('names a scheme that could not be loaded, not the variables, when the coding is hidden', () => {
      const input = okInput();
      input.hiddenRoutes = ['schemer'];
      input.scheme = undefined;

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.scheme-not-loaded' }]);
    });

    it('still names a missing player, which the export needs whether the preview is shown or not', () => {
      const input = okInput();
      input.hiddenRoutes = ['preview', 'editor', 'schemer'];
      input.modules = {};

      expect(section(checkUnit(input), 'properties')?.findings).toEqual([{ key: 'unit-check.no-player' }]);
    });
  });
});

describe('withKeyFindings', () => {
  const keyFinding = { key: 'unit-check.key-taken', params: { key: 'UNIT_01' } };

  // a key in an older format is saved all the same (#1842)
  it('leaves the properties in order with a hint about the key, and shows it', () => {
    const hint = { key: 'unit-check.key-format', params: { key: '00_INVALID_NAME' }, hint: true };

    expect(section(withKeyFindings(checkUnit(okInput()), [hint]), 'properties')).toEqual(expect.objectContaining({
      findings: [hint], status: 'info'
    }));
  });

  it('puts what is wrong with the key first under the properties, which are then not in order', () => {
    const input = okInput();
    input.modules = { ...input.modules, player: '' };
    const sections = withKeyFindings(checkUnit(input), [keyFinding]);

    expect(section(sections, 'properties')).toEqual(expect.objectContaining({
      findings: [keyFinding, { key: 'unit-check.no-player' }],
      status: 'warning'
    }));
    expect(section(sections, 'editor')?.status).toBe('ok');
  });

  it('leaves the sections as they are when the key is in order', () => {
    const sections = checkUnit(okInput());

    expect(withKeyFindings(sections, [])).toBe(sections);
  });
});
