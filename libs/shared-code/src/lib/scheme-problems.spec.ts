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
    ]))).toEqual([{ type: 'NAME_TWICE', variable: 'text_1', breaking: true }]);
  });

  it('names a variable without codes, which does not break the coding', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
      }
    ]))).toEqual([{ type: 'VACANT', variable: '_01a', breaking: false }]);
  });

  it('names what breaks the coding before what does not', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    expect(findSchemeProblems(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      },
      {
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['drop_1', 'gone'], codes: []
      }
    ]))).toEqual([
      { type: 'SOURCE_MISSING', variable: 'sum', breaking: true },
      { type: 'VACANT', variable: 'sum', breaking: false }
    ]);
  });

  // the schemer converts an older scheme when it opens it; held against the current format, it would fail
  it('leaves a scheme of an older format unasked', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];

    expect(findSchemeProblems(variables, JSON.stringify({
      variableCodings: [{
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
      }]
    }))).toEqual([]);
  });

  it('asks a scheme of any version from 3 on, however it is written', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];
    const uncoded = (version: string) => JSON.stringify({
      version,
      variableCodings: [{
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
      }]
    });

    expect(['3', '3.5', '4.0'].map(version => findSchemeProblems(variables, uncoded(version)).length))
      .toEqual([1, 1, 1]);
    expect(findSchemeProblems(variables, uncoded('2.1'))).toEqual([]);
  });

  it('names a scheme it cannot read rather than finding nothing wrong with it', () => {
    const unreadable = [{ type: 'UNREADABLE', breaking: true }];

    expect(findSchemeProblems([], '{"version": "3.0", "variableCodings": [')).toEqual(unreadable);
    // the validation itself stops at a coding that is not one
    expect(findSchemeProblems([], JSON.stringify({ version: '3.0', variableCodings: [null] }))).toEqual(unreadable);
  });
});
