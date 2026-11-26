import { areValidUnitSizeLevels, DEFAULT_UNIT_SIZE_LEVELS } from './unit-size-levels';

describe('areValidUnitSizeLevels', () => {
  it('takes whole numbers above 0, each above the one before', () => {
    expect(areValidUnitSizeLevels(DEFAULT_UNIT_SIZE_LEVELS)).toBe(true);
    expect(areValidUnitSizeLevels({ mediumFromKb: 1, largeFromKb: 2, veryLargeFromKb: 3 })).toBe(true);
  });

  // a level that is never reached, or that starts below the one before (#2229)
  it('refuses bounds that do not rise', () => {
    expect(areValidUnitSizeLevels({ mediumFromKb: 200, largeFromKb: 200, veryLargeFromKb: 5120 })).toBe(false);
    expect(areValidUnitSizeLevels({ mediumFromKb: 200, largeFromKb: 5120, veryLargeFromKb: 1024 })).toBe(false);
  });

  it('refuses zero, negative and broken numbers, text and missing bounds', () => {
    expect(areValidUnitSizeLevels({ mediumFromKb: 0, largeFromKb: 1024, veryLargeFromKb: 5120 })).toBe(false);
    expect(areValidUnitSizeLevels({ mediumFromKb: -1, largeFromKb: 1024, veryLargeFromKb: 5120 })).toBe(false);
    expect(areValidUnitSizeLevels({ mediumFromKb: 200.5, largeFromKb: 1024, veryLargeFromKb: 5120 })).toBe(false);
    expect(areValidUnitSizeLevels({ mediumFromKb: '200', largeFromKb: 1024, veryLargeFromKb: 5120 })).toBe(false);
    expect(areValidUnitSizeLevels({ mediumFromKb: 200, largeFromKb: 1024 })).toBe(false);
    expect(areValidUnitSizeLevels(null)).toBe(false);
  });
});
