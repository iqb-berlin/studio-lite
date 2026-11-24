import { CodingSchemeFactory, VariableInfoInput } from '@iqb/responses';
import { findSchemeProblems as findWith } from './scheme-problems';

// the validation the schemer runs, as the callers hand it in
const findSchemeProblems = (
  variables: VariableInfoInput[],
  scheme: string
) => findWith(variables, scheme, CodingSchemeFactory.validate);

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

const coded = {
  codes: [{
    id: 1,
    type: 'FULL_CREDIT',
    label: '',
    score: 1,
    ruleSetOperatorAnd: false,
    manualInstruction: '',
    ruleSets: [{ ruleOperatorAnd: false, rules: [{ method: 'IS_EMPTY' }] }]
  }]
};

describe('findSchemeProblems', () => {
  it('finds nothing wrong with a variable that is coded', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      }
    ]))).toEqual([]);
  });

  it('finds nothing in a unit without a scheme', () => {
    expect(findSchemeProblems([], '')).toEqual([]);
  });

  // as in a unit whose elements were copied from another page with their names (#2135)
  it('names two variables of the same name once, as such, as breaking the coding', () => {
    const variables: VariableInfoInput[] = [
      { id: 'text_1749756922777_1', alias: 'text_1', type: 'no-value' },
      { id: 'text_1749757116310_1', alias: 'text_1', type: 'no-value' }
    ];

    expect(findSchemeProblems(variables, scheme([
      { id: 'text_1749756922777_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_1749757116310_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ]))).toEqual([{
      type: 'NAME_TWICE', variable: 'text_1', breaking: true, baseVariable: true
    }]);
  });

  // as the storage area of a drag-and-drop task, which is not meant to be coded (#2135)
  it('leaves out a variable without codes', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_ablage', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '_ablage', sourceType: 'BASE', codes: []
      }
    ]))).toEqual([]);
  });

  it('names what breaks the coding before what does not', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      },
      {
        id: 'copy_1', alias: 'copy', sourceType: 'COPY_VALUE', deriveSources: ['drop_1', 'drop_1'], codes: []
      },
      {
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['drop_1', 'gone'], ...coded
      }
    ]))).toEqual([
      {
        type: 'SOURCE_MISSING', variable: 'sum', breaking: true, baseVariable: false
      },
      {
        type: 'MORE_THAN_ONE_SOURCE', variable: 'copy', breaking: false, baseVariable: false
      }
    ]);
  });

  // an element deleted in the editor, whose coding stayed behind: it is deleted in the coding (#2135)
  it('names a coding whose element is gone, as no base variable', () => {
    expect(findSchemeProblems([], scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      }
    ]))).toEqual([{
      type: 'SOURCE_MISSING', variable: '01', breaking: true, baseVariable: false
    }]);
  });

  // a video replaced in the editor: its old coding has no codes, and deleting it loses nothing (#2135)
  it('leaves out a coding whose element is gone when it codes nothing', () => {
    const variables: VariableInfoInput[] = [{ id: 'video_new', alias: 'video_1', type: 'number' }];

    expect(findSchemeProblems(variables, scheme([
      { id: 'video_old', sourceType: 'BASE', codes: [] },
      { id: 'text_old', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ]))).toEqual([]);
  });

  it('names a coding whose element is gone and that codes, beside an empty one of its name', () => {
    expect(findSchemeProblems([], scheme([
      { id: 'old_a', alias: '01', sourceType: 'BASE' },
      {
        id: 'old_b', alias: '01', sourceType: 'BASE', ...coded
      }
    ])).map(problem => problem.type)).toContain('SOURCE_MISSING');
  });

  // an element deleted and another added under its name: the editor shows only one of them (#2135)
  it('does not take a name that an orphaned coding shares for a base variable', () => {
    const variables: VariableInfoInput[] = [{ id: 'text_new', alias: 'text_1', type: 'no-value' }];

    expect(findSchemeProblems(variables, scheme([
      { id: 'text_old', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_new', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ])).filter(problem => problem.baseVariable)).toEqual([]);
  });

  // the editor shows them by their aliases, not by the internal id they share (#2135)
  it('takes two elements of the same internal id for base variables by their names only', () => {
    const variables: VariableInfoInput[] = [
      { id: 'text_x', alias: 'text_1', type: 'no-value' },
      { id: 'text_x', alias: 'text_2', type: 'no-value' }
    ];

    expect(findSchemeProblems(variables, scheme([
      { id: 'text_x', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_x', alias: 'text_2', sourceType: 'BASE_NO_VALUE' }
    ])).map(problem => [problem.variable, problem.baseVariable]).sort()).toEqual([
      ['text_1', true], ['text_2', true], ['text_x', false]
    ]);
  });

  // renaming the derived variable in the coding resolves it, not the element
  it('does not take a name that a base and a derived variable share for a base variable', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      },
      {
        id: 'copy_1', alias: '01', sourceType: 'COPY_VALUE', deriveSources: ['drop_1'], ...coded
      }
    ])).map(problem => [problem.variable, problem.baseVariable])).toEqual([['01', false]]);
  });

  // the derived variable took the name the element goes by, its id (#2135)
  it('names an alias that equals the id of a coding without one as a name used twice', () => {
    const variables: VariableInfoInput[] = [{ id: 'x', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      { id: 'x', sourceType: 'BASE', ...coded },
      {
        id: 'd_1', alias: 'x', sourceType: 'MANUAL', ...coded
      }
    ])).map(problem => problem.type)).toEqual(['NAME_TWICE', 'SOURCE_MISSING']);
  });

  // the schemer allows the pair; what it finds wrong under the name lies elsewhere
  it('does not take a derived variable that has the name of its own source for a name used twice', () => {
    const variables: VariableInfoInput[] = [{ id: 'x', type: 'string' }, { id: 'x', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      { id: 'x', sourceType: 'BASE', ...coded },
      {
        id: 'd_1', alias: 'x', sourceType: 'COPY_VALUE', deriveSources: ['x'], ...coded
      }
    ])).map(problem => problem.type)).toEqual(['INVALID_SOURCE']);
  });

  // the schemer allows the pair only as a pair
  it('names a name that two derived variables take from their source as a name used twice', () => {
    const variables: VariableInfoInput[] = [{ id: 'x', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      { id: 'x', sourceType: 'BASE', ...coded },
      {
        id: 'd_1', alias: 'x', sourceType: 'COPY_VALUE', deriveSources: ['x'], ...coded
      },
      {
        id: 'd_2', alias: 'x', sourceType: 'COPY_VALUE', deriveSources: ['x'], ...coded
      }
    ])).map(problem => problem.type)).toContain('NAME_TWICE');
  });

  // as from an import: one element, its coding twice -- renaming in the editor would not resolve it
  it('names a coding that occurs twice as such, in the coding', () => {
    const variables: VariableInfoInput[] = [{ id: 'x', alias: 'x', type: 'string' }];
    const twice = {
      id: 'x', alias: 'x', sourceType: 'BASE', ...coded
    };

    expect(findSchemeProblems(variables, scheme([twice, twice]))).toEqual([{
      type: 'INVALID_SOURCE', variable: 'x', breaking: true, baseVariable: false
    }]);
  });

  // as elements copied with their id: the id is made unique in the editor
  it('takes a coding that occurs as often as its element for a base variable', () => {
    const variables: VariableInfoInput[] = [
      { id: 'x', alias: 'x', type: 'string' }, { id: 'x', alias: 'x', type: 'string' }
    ];
    const twice = {
      id: 'x', alias: 'x', sourceType: 'BASE', ...coded
    };

    expect(findSchemeProblems(variables, scheme([twice, twice]))).toEqual([{
      type: 'INVALID_SOURCE', variable: 'x', breaking: true, baseVariable: true
    }]);
  });

  // as the source lists of a drag-and-drop the schemer deactivated: its "Deaktivieren" codes an element
  // that has a value as one without, and the coding skips it (#2135)
  it('finds nothing wrong with an element the schemer deactivated', () => {
    const variables: VariableInfoInput[] = [
      { id: 'drop-list_1', alias: '_03a', type: 'string' },
      { id: 'drop-list_2', alias: '03', type: 'string' }
    ];

    expect(findSchemeProblems(variables, scheme([
      { id: 'drop-list_1', alias: '_03a', sourceType: 'BASE_NO_VALUE' },
      {
        id: 'drop-list_2', alias: '03', sourceType: 'BASE', ...coded
      }
    ]))).toEqual([]);
  });

  it('still names an element the schemer deactivated when its id is used twice', () => {
    const variables: VariableInfoInput[] = [
      { id: 'text_x', alias: '_00a', type: 'string' },
      { id: 'text_x', alias: '_00a', type: 'string' }
    ];

    expect(findSchemeProblems(variables, scheme([
      { id: 'text_x', alias: '_00a', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_x', alias: '_00a', sourceType: 'BASE_NO_VALUE' }
    ])).map(problem => [problem.type, problem.variable]).sort()).toEqual([
      ['INVALID_SOURCE', '_00a'], ['INVALID_SOURCE', 'text_x']
    ]);
  });

  describe('the position -1 in a rule set, which older schemers wrote for "no position" (#2135)', () => {
    // a drop list that takes several items, as in a unit coded with schemer 2.5
    const dropList: VariableInfoInput = {
      id: 'drop-list_6', alias: '01', type: 'string', multiple: true
    };
    const codedAt = (valueArrayPos: number, variable = dropList) => findSchemeProblems([variable], scheme([{
      id: variable.id,
      alias: variable.alias,
      sourceType: 'BASE',
      codes: [{
        ...coded.codes[0],
        ruleSets: [{ valueArrayPos, ruleOperatorAnd: false, rules: [{ method: 'MATCH', parameters: ['01_5'] }] }]
      }]
    }]));

    // the coding reads it so: a negative position picks no item, and the rules see the whole value
    it('finds nothing wrong with it', () => {
      expect(codedAt(-1)).toEqual([]);
    });

    it('still names any other negative position', () => {
      expect(codedAt(-2).map(problem => problem.type)).toEqual(['RULESET_VALUE_ARRAY_POS_INVALID']);
    });

    it('still names a position at a variable of a single value', () => {
      expect(codedAt(0, { ...dropList, multiple: false }).map(problem => problem.type))
        .toEqual(['RULESET_VALUE_ARRAY_POS_INVALID']);
    });
  });

  // the schemer converts an older scheme when it opens it; held against the current format, it would fail
  it('leaves a scheme of an older format unasked', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];

    expect(findSchemeProblems(variables, JSON.stringify({
      variableCodings: [{
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['drop_1', 'gone'], ...coded
      }]
    }))).toEqual([]);
  });

  it('asks a scheme of any version from 3 on, however it is written', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];
    const faulty = (version: string) => JSON.stringify({
      version,
      variableCodings: [{
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', ...coded
      }, {
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['drop_1', 'gone'], ...coded
      }]
    });

    expect(['3', '3.5', '4.0'].map(version => findSchemeProblems(variables, faulty(version)).length))
      .toEqual([1, 1, 1]);
    expect(findSchemeProblems(variables, faulty('2.1'))).toEqual([]);
  });

  // the export check asks every unit of a workspace from its saved list as it is (#2135)
  it('reads past variables that are not a list, and past entries that are no variable', () => {
    const codings = scheme([{
      id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
    }]);
    const notAList = JSON.parse('{}');
    const withNull = JSON.parse('[null, {"id": "drop_1", "alias": "01", "type": "string"}]');

    expect(findSchemeProblems(withNull, codings)).toEqual([]);
    expect(findSchemeProblems(notAList, codings).map(problem => problem.type)).toEqual(['SOURCE_MISSING']);
  });

  it('names a scheme it cannot read rather than finding nothing wrong with it', () => {
    const unreadable = [{ type: 'UNREADABLE', breaking: true, baseVariable: false }];

    expect(findSchemeProblems([], '{"version": "3.0", "variableCodings": [')).toEqual(unreadable);
    // the validation itself stops at a coding that is not one
    expect(findSchemeProblems([], JSON.stringify({ version: '3.0', variableCodings: [null] }))).toEqual(unreadable);
  });
});
