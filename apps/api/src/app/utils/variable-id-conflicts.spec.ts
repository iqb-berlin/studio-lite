import { findVariableIdConflicts } from './variable-id-conflicts';

const schemeOf = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

describe('findVariableIdConflicts', () => {
  it('names a derived alias that equals the internal id of a base variable (#2119)', () => {
    const conflicts = findVariableIdConflicts(
      [{ id: '05', alias: '_00a' }],
      schemeOf([
        { id: '05', alias: '_00a', sourceType: 'BASE' },
        { id: 'd_1790938214783', alias: '05', sourceType: 'MANUAL' }
      ])
    );

    expect(conflicts).toEqual([{
      id: '05',
      variables: [
        { kind: 'base', id: '05', alias: '_00a' },
        { kind: 'derived', id: 'd_1790938214783', alias: '05' }
      ]
    }]);
  });

  it('counts a derived variable without an alias under its id', () => {
    const conflicts = findVariableIdConflicts(
      [{ id: 'sum' }],
      schemeOf([{ id: 'sum', sourceType: 'SUM_SCORE' }])
    );

    expect(conflicts.map(conflict => conflict.id)).toEqual(['sum']);
  });

  it('names two derived variables written under the same id', () => {
    const conflicts = findVariableIdConflicts(
      [],
      schemeOf([
        { id: 'd_1', alias: 'd_2', sourceType: 'MANUAL' },
        { id: 'd_2', sourceType: 'SUM_SCORE' }
      ])
    );

    expect(conflicts.map(conflict => conflict.id)).toEqual(['d_2']);
  });

  it('finds none where a derived alias equals only the alias of a base variable', () => {
    // the export writes a base variable under its id; its alias is a field of its own
    expect(findVariableIdConflicts(
      [{ id: 'text_1743412177740_1', alias: 'text_1' }],
      schemeOf([{ id: 'd_1', alias: 'text_1', sourceType: 'MANUAL' }])
    )).toEqual([]);
  });

  it('finds none without a readable scheme or without variables', () => {
    expect(findVariableIdConflicts([{ id: '05' }], '')).toEqual([]);
    expect(findVariableIdConflicts([{ id: '05' }], '{broken')).toEqual([]);
    expect(findVariableIdConflicts(null, null)).toEqual([]);
  });
});
