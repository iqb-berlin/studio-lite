import { UnitSizeLevels } from '@studio-lite/shared-code';

/** How large a unit's definition is, as the unit check names it (#2197). */
export type DefinitionSizeLevel = 'small' | 'medium' | 'large' | 'very-large';

const KB = 1024;

/**
 * The level of a definition of that many bytes, by where the levels begin: as an administrator set them
 * in the settings, or the defaults (#2229). A size right at a bound belongs to the level above.
 */
export function definitionSizeLevel(bytes: number, levels: UnitSizeLevels): DefinitionSizeLevel {
  if (bytes >= levels.veryLargeFromKb * KB) return 'very-large';
  if (bytes >= levels.largeFromKb * KB) return 'large';
  if (bytes >= levels.mediumFromKb * KB) return 'medium';
  return 'small';
}

const encoder = new TextEncoder();

/**
 * The size of a text as it is stored and sent, in UTF-8: an "ä" counts twice, where `length`
 * counts it once (#2197).
 */
export function byteLength(text: string | undefined): number {
  return text ? encoder.encode(text).length : 0;
}
