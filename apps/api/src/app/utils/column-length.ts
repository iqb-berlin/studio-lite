import { BadRequestException } from '@nestjs/common';

/**
 * A VARCHAR column counts characters, where `length` counts UTF-16 units and takes a character
 * beyond the BMP for two.
 */
const characters = (value: string): string[] => [...value];

/** Whether a value fits a column of this length; a value that is no string is left to the caller. */
export function fitsColumn(value: unknown, maxLength: number): boolean {
  return typeof value !== 'string' || characters(value).length <= maxLength;
}

/** The value cut to the length of the column, without splitting a character. */
export function cutToColumn(value: string, maxLength: number): string {
  return characters(value).slice(0, maxLength).join('');
}

/**
 * Refuses a value longer than the column it goes into. The database refuses it too, but its error
 * reached the user as a server problem (#2120, #2128, #2131).
 */
export function assertFitsColumn(field: string, value: unknown, maxLength: number): void {
  if (!fitsColumn(value, maxLength)) {
    throw new BadRequestException(`Unit ${field} is longer than ${maxLength} characters`);
  }
}
