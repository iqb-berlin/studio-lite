import { VariableInfoInput } from '@iqb/responses';
import { schemeProblemFindings } from './scheme-problems.utils';

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

describe('schemeProblemFindings', () => {
  it('finds nothing wrong with a variable that is coded', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    expect(schemeProblemFindings(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      }
    ]))).toEqual([]);
  });

  // as in a unit whose elements were copied from another page with their names (#2135)
  it('names two variables of the same name once, as such', () => {
    const variables: VariableInfoInput[] = [
      { id: 'text_1749756922777_1', alias: 'text_1', type: 'no-value' },
      { id: 'text_1749757116310_1', alias: 'text_1', type: 'no-value' }
    ];

    expect(schemeProblemFindings(variables, scheme([
      { id: 'text_1749756922777_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_1749757116310_1', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ]))).toEqual([{ key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' } }]);
  });

  it('names a variable without codes', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];

    expect(schemeProblemFindings(variables, scheme([
      {
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
      }
    ]))).toEqual([{ key: 'unit-check.scheme-problem.VACANT', params: { variable: '_01a' } }]);
  });

  it('names what breaks the coding before what does not', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '01', type: 'string' }];

    const findings = schemeProblemFindings(variables, scheme([
      {
        id: 'drop_1', alias: '01', sourceType: 'BASE', ...coded
      },
      {
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['drop_1', 'gone'], codes: []
      }
    ]));

    expect(findings.map(finding => finding.key)).toEqual([
      'unit-check.scheme-problem.SOURCE_MISSING',
      'unit-check.scheme-problem.VACANT'
    ]);
    expect(findings[0].params).toEqual({ variable: 'sum' });
  });

  // the schemer converts an older scheme when it opens it; held against the current format, it would fail
  it('leaves a scheme of an older format unasked', () => {
    const variables: VariableInfoInput[] = [{ id: 'drop_1', alias: '_01a', type: 'string' }];

    expect(schemeProblemFindings(variables, JSON.stringify({
      variableCodings: [{
        id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
      }]
    }))).toEqual([]);
  });

  it('names a scheme it cannot read rather than finding nothing wrong with it', () => {
    expect(schemeProblemFindings([], '{"version": "3.0", "variableCodings": [')).toEqual([
      { key: 'unit-check.scheme-unreadable' }
    ]);
    // the validation itself stops at a coding that is not one
    expect(schemeProblemFindings([], JSON.stringify({ version: '3.0', variableCodings: [null] }))).toEqual([
      { key: 'unit-check.scheme-unreadable' }
    ]);
  });
});
