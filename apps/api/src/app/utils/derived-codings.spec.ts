import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { parseDerivedCodings } from './derived-codings';

describe('parseDerivedCodings', () => {
  const schemeOf = (variableCodings: unknown[]): UnitSchemeDto => ({
    scheme: JSON.stringify({ version: '3.0', variableCodings }),
    schemeType: ''
  });

  it('returns the codings that derive a variable', () => {
    const derived = parseDerivedCodings(schemeOf([
      { id: 'v1', sourceType: 'BASE' },
      { id: 'nv', sourceType: 'BASE_NO_VALUE' },
      { id: 'sum', sourceType: 'SUM_SCORE' },
      { id: 'copy', sourceType: 'COPY_VALUE' }
    ]));

    expect(derived.map(coding => coding.id)).toEqual(['sum', 'copy']);
  });

  it('derives nothing from a missing scheme', () => {
    expect(parseDerivedCodings({ scheme: '', schemeType: '' })).toEqual([]);
    expect(parseDerivedCodings(undefined as unknown as UnitSchemeDto)).toEqual([]);
  });

  it('derives nothing from an unreadable scheme', () => {
    expect(parseDerivedCodings({ scheme: '{broken', schemeType: '' })).toEqual([]);
  });

  it('derives nothing from a scheme without codings', () => {
    expect(parseDerivedCodings({ scheme: '{}', schemeType: '' })).toEqual([]);
  });
});
