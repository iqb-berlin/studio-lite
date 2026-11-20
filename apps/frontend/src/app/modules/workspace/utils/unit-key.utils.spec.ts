import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { checkUnitKey, isUnitKeyTaken } from './unit-key.utils';

const unitList: { [group: string]: UnitInListDto[] } = {
  '': [{ id: 1, key: 'UNIT_01' }],
  Lesen: [{ id: 2, key: 'Lesen_02 ' }]
};

const findingKeys = (key: string | undefined, unitId = 9): string[] => checkUnitKey(key, unitId, unitList)
  .map(finding => finding.key);

describe('checkUnitKey', () => {
  it('finds nothing wrong with a key the forms accept', () => {
    expect(checkUnitKey('UNIT_09', 9, unitList)).toEqual([]);
  });

  it('names a missing key, and nothing else about it', () => {
    expect(findingKeys('')).toEqual(['unit-check.key-missing']);
    expect(findingKeys(undefined)).toEqual(['unit-check.key-missing']);
    expect(findingKeys('   ')).toEqual(['unit-check.key-missing']);
  });

  it('names a key too short or too long, with the limits', () => {
    expect(checkUnitKey('AB', 9, unitList)).toEqual([
      { key: 'unit-check.key-length', params: { key: 'AB', min: '3', max: '20' } }
    ]);
    expect(findingKeys('A'.repeat(21))).toEqual(['unit-check.key-length']);
    expect(findingKeys('A'.repeat(20))).toEqual([]);
  });

  // a key the form does not let through can still come with an import (#2135)
  it('names a key that does not start with a letter', () => {
    expect(checkUnitKey('00_INVALID_NAME', 9, unitList)).toEqual([
      { key: 'unit-check.key-format', params: { key: '00_INVALID_NAME' } }
    ]);
  });

  it('names a key with a character the form does not allow', () => {
    expect(findingKeys('UNIT 09')).toEqual(['unit-check.key-format']);
    expect(findingKeys('UNIT_ä')).toEqual(['unit-check.key-format']);
  });

  it('names every rule a key breaks', () => {
    expect(findingKeys('0')).toEqual(['unit-check.key-length', 'unit-check.key-format']);
  });

  it('names a key another unit of the workspace has', () => {
    expect(findingKeys('unit_01')).toEqual(['unit-check.key-taken']);
  });
});

describe('isUnitKeyTaken', () => {
  it('compares keys in any case and with spaces aside, across all groups', () => {
    expect(isUnitKeyTaken('lesen_02', 9, unitList)).toBe(true);
    expect(isUnitKeyTaken(' UNIT_01', 9, unitList)).toBe(true);
    expect(isUnitKeyTaken('UNIT_03', 9, unitList)).toBe(false);
  });

  it('does not count the unit\'s own key as taken', () => {
    expect(isUnitKeyTaken('UNIT_01', 1, unitList)).toBe(false);
  });
});
