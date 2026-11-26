/**
 * Where the levels of a unit's size begin, in KB: below `mediumFromKb` a unit counts as small, from
 * `veryLargeFromKb` on as very large (#2197). An administrator sets them in the settings (#2229).
 */
export interface UnitSizeLevels {
  mediumFromKb: number;
  largeFromKb: number;
  veryLargeFromKb: number;
}

/**
 * The levels until an administrator sets others. No distribution of the units in use was at hand; 26
 * aspect units were measured instead. An element takes 1.1-1.6 KB and a page next to nothing -- nine
 * pages of 59 elements came to 73 KB --, while what makes a unit large is the media it embeds:
 * 106-199 KB with a few images, 7 MB with many, 16 MB with a video (#2197).
 */
export const DEFAULT_UNIT_SIZE_LEVELS: Readonly<UnitSizeLevels> = {
  mediumFromKb: 200,
  largeFromKb: 1024,
  veryLargeFromKb: 5120
};

const isWholeAboveZero = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;

/**
 * Whether the bounds can be stored: whole numbers of KB above 0, each above the one before. Otherwise a
 * level would never be reached, and the check would name sizes by levels nobody set. Asked by the form
 * and by the API alike, so that what one lets through the other does not refuse (#2229).
 */
export function areValidUnitSizeLevels(levels: unknown): levels is UnitSizeLevels {
  if (!levels || typeof levels !== 'object') return false;
  const { mediumFromKb, largeFromKb, veryLargeFromKb } = levels as Partial<Record<keyof UnitSizeLevels, unknown>>;
  return isWholeAboveZero(mediumFromKb) && isWholeAboveZero(largeFromKb) && isWholeAboveZero(veryLargeFromKb) &&
    mediumFromKb < largeFromKb && largeFromKb < veryLargeFromKb;
}
