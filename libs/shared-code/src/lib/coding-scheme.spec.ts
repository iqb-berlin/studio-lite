import { parseDerivedCodings } from './coding-scheme';

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
