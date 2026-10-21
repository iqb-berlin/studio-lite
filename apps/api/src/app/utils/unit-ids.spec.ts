import { unitIdOf, unitIdsOfList, unitIdsOfQuery } from './unit-ids';

describe('unit ids', () => {
  describe('unitIdOf', () => {
    it.each([[10, 10], ['10', 10], [2147483647, 2147483647]])(
      'reads %p as unit %p',
      (raw, unitId) => {
        expect(unitIdOf(raw)).toBe(unitId);
      }
    );

    it.each([
      0, -1, 1.5, '0', '010', ' 10', '10.0', '0xa', 'abc', '', null, undefined, {}, 2147483648, '2147483648', 1e21
    ])(
      'reads %p as no unit',
      raw => {
        expect(unitIdOf(raw)).toBe(0);
      }
    );
  });

  describe('unitIdsOfList', () => {
    it('reads every entry of the list', () => {
      expect(unitIdsOfList([10, '11', 'abc'])).toEqual([10, 11, 0]);
    });

    it.each(['10', undefined, { ids: [10] }])('reads %p as one malformed unit', raw => {
      expect(unitIdsOfList(raw)).toEqual([0]);
    });

    it('reads an empty list as no units', () => {
      expect(unitIdsOfList([])).toEqual([]);
    });
  });

  describe('unitIdsOfQuery', () => {
    it('reads a comma-separated list', () => {
      expect(unitIdsOfQuery('10,11')).toEqual([10, 11]);
    });

    it('reads a repeated parameter as one list', () => {
      expect(unitIdsOfQuery(['10', '11,12'])).toEqual([10, 11, 12]);
    });

    it.each(['10,', '10,abc', ''])('reads a malformed entry of %p as 0', raw => {
      expect(unitIdsOfQuery(raw)).toContain(0);
    });

    it('reads a missing parameter as one malformed unit', () => {
      expect(unitIdsOfQuery(undefined)).toEqual([0]);
    });
  });
});
