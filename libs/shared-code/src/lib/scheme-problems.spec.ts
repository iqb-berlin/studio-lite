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

  it('names a scheme it cannot read rather than finding nothing wrong with it', () => {
    const unreadable = [{ type: 'UNREADABLE', breaking: true, baseVariable: false }];

    expect(findSchemeProblems([], '{"version": "3.0", "variableCodings": [')).toEqual(unreadable);
    // the validation itself stops at a coding that is not one
    expect(findSchemeProblems([], JSON.stringify({ version: '3.0', variableCodings: [null] }))).toEqual(unreadable);
  });
});
