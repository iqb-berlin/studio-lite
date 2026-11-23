import { VariableInfoInput } from '@iqb/responses';
import { schemeProblemFinding, schemeProblemFindings } from './scheme-problems.utils';

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

const codeWithRule = (rule: unknown) => ({
  codes: [{
    id: 1,
    type: 'FULL_CREDIT',
    label: '',
    score: 1,
    ruleSetOperatorAnd: false,
    manualInstruction: '',
    ruleSets: [{ ruleOperatorAnd: false, rules: [rule] }]
  }]
});

// what the schemer finds is tested in libs/shared-code (scheme-problems.spec.ts); here, how it is named
describe('schemeProblemFinding', () => {
  it('names a problem by its text, filled with the variable', () => {
    expect(schemeProblemFinding({ type: 'NAME_TWICE', variable: 'text_1' })).toEqual({
      key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' }
    });
  });

  it('names a scheme it cannot read without a variable', () => {
    expect(schemeProblemFinding({ type: 'UNREADABLE' })).toEqual({ key: 'unit-check.scheme-unreadable' });
  });
});

describe('schemeProblemFindings', () => {
  // elements copied with their names (#2135)
  const nameTwice = {
    variables: [
      { id: 'text_a', alias: 'text_1', type: 'no-value' },
      { id: 'text_b', alias: 'text_1', type: 'no-value' }
    ] satisfies VariableInfoInput[],
    scheme: scheme([
      { id: 'text_a', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_b', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }
    ])
  };

  it('names a problem whose cause is an element under the editor, with what to do there', () => {
    expect(schemeProblemFindings(nameTwice.variables, nameTwice.scheme, true)).toEqual({
      editor: [{ key: 'unit-check.element-problem.NAME_TWICE', params: { variable: 'text_1' } }],
      schemer: []
    });
  });

  it('leaves it to the coding when the workspace hides the editor', () => {
    expect(schemeProblemFindings(nameTwice.variables, nameTwice.scheme, false)).toEqual({
      editor: [],
      schemer: [{ key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' } }]
    });
  });

  // the rule is written in the coding, whichever variable it codes
  it('leaves a rule of a base variable to the coding', () => {
    const variables: VariableInfoInput[] = [{ id: 'input_1', alias: '01', type: 'string' }];

    expect(schemeProblemFindings(variables, scheme([{
      id: 'input_1', alias: '01', sourceType: 'BASE', ...codeWithRule({ method: 'MATCH_REGEX', parameters: ['('] })
    }]), true)).toEqual({
      editor: [],
      schemer: [{ key: 'unit-check.scheme-problem.RULE_REGEX_INVALID', params: { variable: '01' } }]
    });
  });

  // an element created again gets another internal id; only deleting the coding resolves it (#2135)
  it('leaves a coding whose element is gone to the coding', () => {
    expect(schemeProblemFindings([], scheme([{
      id: 'input_1', alias: '01', sourceType: 'BASE', ...codeWithRule({ method: 'IS_EMPTY' })
    }]), true)).toEqual({
      editor: [],
      schemer: [{ key: 'unit-check.scheme-problem.SOURCE_MISSING', params: { variable: '01' } }]
    });
  });

  it('leaves a problem of a derived variable to the coding', () => {
    const variables: VariableInfoInput[] = [{ id: 'input_1', alias: '01', type: 'string' }];
    const coded = codeWithRule({ method: 'IS_EMPTY' });

    expect(schemeProblemFindings(variables, scheme([
      {
        id: 'input_1', alias: '01', sourceType: 'BASE', ...coded
      },
      {
        id: 'sum_1', alias: 'sum', sourceType: 'SUM_SCORE', deriveSources: ['input_1', 'gone'], ...coded
      }
    ]), true)).toEqual({
      editor: [],
      schemer: [{ key: 'unit-check.scheme-problem.SOURCE_MISSING', params: { variable: 'sum' } }]
    });
  });
});
