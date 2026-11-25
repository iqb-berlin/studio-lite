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

  // a short key is saved all the same, as older units have them (#1842): a hint
  it('names a key too short as a hint, with the limit', () => {
    expect(checkUnitKey('AB', 9, unitList)).toEqual([
      { key: 'unit-check.key-too-short', params: { key: 'AB', min: '3' }, hint: true }
    ]);
    expect(findingKeys('ABC')).toEqual([]);
  });

  // the database column holds 20 characters: a longer key cannot be saved
  it('names a key too long as a problem, with the limit', () => {
    expect(checkUnitKey('A'.repeat(21), 9, unitList)).toEqual([
      { key: 'unit-check.key-too-long', params: { key: 'A'.repeat(21), max: '20' } }
    ]);
    expect(findingKeys('A'.repeat(20))).toEqual([]);
  });

  // a key the form marks is saved all the same, and older units have such keys (#1842): a hint
  it('names a key that does not start with a letter as a hint', () => {
    expect(checkUnitKey('00_INVALID_NAME', 9, unitList)).toEqual([
      { key: 'unit-check.key-format', params: { key: '00_INVALID_NAME' }, hint: true }
    ]);
  });

  it('names a key with a character the form does not allow', () => {
    expect(findingKeys('UNIT 09')).toEqual(['unit-check.key-format']);
    expect(findingKeys('UNIT_ä')).toEqual(['unit-check.key-format']);
  });

  it('names every rule a key breaks', () => {
    expect(findingKeys('0')).toEqual(['unit-check.key-too-short', 'unit-check.key-format']);
  });

  // the save is refused: a problem, not a hint
  it('names a key another unit of the workspace has', () => {
    expect(checkUnitKey('unit_01', 9, unitList)).toEqual([{ key: 'unit-check.key-taken', params: { key: 'unit_01' } }]);
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
