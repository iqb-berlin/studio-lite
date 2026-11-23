import { parseDerivedCodings, schemeWithVariables } from './coding-scheme';

const schemeOf = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

describe('parseDerivedCodings', () => {
  it('returns the codings that derive a variable', () => {
    const derived = parseDerivedCodings(schemeOf([
      { id: 'v1', sourceType: 'BASE' },
      { id: 'nv', sourceType: 'BASE_NO_VALUE' },
      { id: 'sum', sourceType: 'SUM_SCORE' },
      { id: 'copy', sourceType: 'COPY_VALUE' }
    ]));

    expect(derived.map(coding => coding.id)).toEqual(['sum', 'copy']);
  });

  it('derives nothing from a missing, unreadable or empty scheme', () => {
    expect(parseDerivedCodings('')).toEqual([]);
    expect(parseDerivedCodings(undefined)).toEqual([]);
    expect(parseDerivedCodings('{broken')).toEqual([]);
    expect(parseDerivedCodings('{}')).toEqual([]);
  });

  // the export check asks every unit of a workspace; one such scheme failed it for all (#2135)
  it('derives nothing from codings that are not a list, and skips entries that are no coding', () => {
    expect(parseDerivedCodings(JSON.stringify({ version: '3.0', variableCodings: { id: 'sum' } }))).toEqual([]);
    expect(parseDerivedCodings('null')).toEqual([]);
    expect(parseDerivedCodings(schemeOf([null, 'sum', { id: 'sum', sourceType: 'SUM_SCORE' }]))
      .map(coding => coding.id)).toEqual(['sum']);
  });
});

describe('schemeWithVariables', () => {
  const codingsOf = (scheme: string): unknown => JSON.parse(scheme).variableCodings;

  // as the unit check sees it before the save: a renamed element no longer shares its old name (#2135)
  it('names the base codings after their elements, and drops those of elements without value that are gone', () => {
    const scheme = schemeOf([
      { id: 'text_a', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'text_b', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
      { id: 'input_1', alias: 'alt', sourceType: 'BASE' },
      { id: 'input_gone', alias: 'stays', sourceType: 'BASE' },
      { id: 'sum', alias: 'sum', sourceType: 'SUM_SCORE' }
    ]);

    expect(codingsOf(schemeWithVariables(scheme, [{ id: 'text_a', alias: 'text_2' }, { id: 'input_1' }]))).toEqual([
      { id: 'text_a', alias: 'text_2', sourceType: 'BASE_NO_VALUE' },
      { id: 'input_1', alias: 'input_1', sourceType: 'BASE' },
      { id: 'input_gone', alias: 'stays', sourceType: 'BASE' },
      { id: 'sum', alias: 'sum', sourceType: 'SUM_SCORE' }
    ]);
  });

  // two elements of one internal id: the save always named the coding after the first (#2135)
  it('names the codings of an id after its first variable, and reads past entries that are no variable', () => {
    const variables = JSON.parse('[null, {"id": "text_x", "alias": "text_1"}, {"id": "text_x", "alias": "text_2"}]');

    expect(codingsOf(schemeWithVariables(schemeOf([
      { id: 'text_x', alias: 'old', sourceType: 'BASE_NO_VALUE' }
    ]), variables))).toEqual([{ id: 'text_x', alias: 'text_1', sourceType: 'BASE_NO_VALUE' }]);
    expect(schemeWithVariables(schemeOf([]), JSON.parse('{}'))).toBe(schemeOf([]));
  });

  it('leaves a scheme without a list of codings, and entries that are no coding, as they are', () => {
    expect(schemeWithVariables('{broken', [])).toBe('{broken');
    expect(schemeWithVariables('null', [])).toBe('null');
    expect(schemeWithVariables('{"version":"3.0"}', [])).toBe('{"version":"3.0"}');
    expect(codingsOf(schemeWithVariables(schemeOf([null, 'x']), []))).toEqual([null, 'x']);
  });
});
