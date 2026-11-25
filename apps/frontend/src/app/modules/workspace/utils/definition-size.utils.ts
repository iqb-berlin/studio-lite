/** How large a unit's definition is, as the unit check names it (#2197). */
export type DefinitionSizeLevel = 'small' | 'medium' | 'large' | 'very-large';

const KB = 1024;
const MB = 1024 * KB;

/**
 * The upper bound of each level but the last, in bytes. No distribution of the units in use was at
 * hand; 26 aspect units were measured instead. An element takes 1.1-1.6 KB and a page next to
 * nothing -- nine pages of 59 elements came to 73 KB --, while what makes a unit large is the media
 * it embeds: 106-199 KB with a few images, 7 MB with many, 16 MB with a video (#2197).
 */
const UPPER_BOUNDS: [DefinitionSizeLevel, number][] = [
  ['small', 200 * KB],
  ['medium', MB],
  ['large', 5 * MB]
];

export function definitionSizeLevel(bytes: number): DefinitionSizeLevel {
  return UPPER_BOUNDS.find(([, bound]) => bytes < bound)?.[0] ?? 'very-large';
}

const encoder = new TextEncoder();

/**
 * The size of a text as it is stored and sent, in UTF-8: an "ä" counts twice, where `length`
 * counts it once (#2197).
 */
export function byteLength(text: string | undefined): number {
  return text ? encoder.encode(text).length : 0;
}
