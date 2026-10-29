import { UnitDefinitionDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { unitVariables } from './unit-variables.utils';

const variable = (id: string, type = 'string', alias?: string): VariableInfo => (
  { id, alias, type } as unknown as VariableInfo
);

const scheme = (variableCodings: object[], variables: VariableInfo[] = []): UnitSchemeDto => ({
  scheme: JSON.stringify({ variableCodings }),
  schemeType: 'iqb@3.4',
  variables
});

describe('unitVariables', () => {
  it('is empty without a scheme', () => {
    expect(unitVariables({ definition: '', variables: [variable('a')] }, undefined)).toEqual([]);
  });

  // Variables without a value are no item variables, in either VariableInfo spelling (#1708).
  it.each(['no-value', 'NO_VALUE'])('leaves variables of type %s out', noValueType => {
    const definition = { variables: [variable('panel', noValueType), variable('text', 'STRING')] } as UnitDefinitionDto;

    expect(unitVariables(definition, scheme([]))).toEqual([{ id: 'text', alias: 'text' }]);
  });

  it('is empty while neither the definition nor the scheme names variables', () => {
    expect(unitVariables(undefined, { scheme: '{}', schemeType: '' })).toEqual([]);
  });

  it('takes the variables of the definition alone while the scheme has no codings', () => {
    const definition = { variables: [variable('a')] } as UnitDefinitionDto;

    expect(unitVariables(definition, { scheme: '{}', schemeType: '' })).toEqual([{ id: 'a', alias: 'a' }]);
  });

  it('takes the stored list of the scheme when there is no definition', () => {
    expect(unitVariables(undefined, scheme([], [variable('stored', 'string', 'Stored')])))
      .toEqual([{ id: 'stored', alias: 'Stored' }]);
  });

  it('adds the variables the scheme derives, and not a base coding the definition has no more', () => {
    const definition = { variables: [variable('a')] } as UnitDefinitionDto;
    const codings = [
      { id: 'a', sourceType: 'BASE' },
      { id: 'gone', sourceType: 'BASE' },
      { id: 'empty', sourceType: 'BASE_NO_VALUE' },
      { id: 'sum', alias: 'Summe', sourceType: 'SUM_SCORE' }
    ];

    expect(unitVariables(definition, scheme(codings))).toEqual([
      { id: 'a', alias: 'a' },
      { id: 'sum', alias: 'Summe' }
    ]);
  });

  it('lists each variable once, sorted by alias', () => {
    const definition = {
      variables: [variable('b', 'string', 'Beta'), variable('a', 'string', 'alpha')]
    } as UnitDefinitionDto;
    const codings = [{ id: 'b', alias: 'Beta', sourceType: 'BASE' }];

    expect(unitVariables(definition, scheme(codings))).toEqual([
      { id: 'a', alias: 'alpha' },
      { id: 'b', alias: 'Beta' }
    ]);
  });
});
