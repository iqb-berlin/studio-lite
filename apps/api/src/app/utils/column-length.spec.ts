import { BadRequestException } from '@nestjs/common';
import { assertFitsColumn, cutToColumn, fitsColumn } from './column-length';

describe('column length', () => {
  // a character beyond the BMP is two UTF-16 units, but one character to the column
  const beyondBmp = '\u{1D465}';

  it('refuses a value longer than the column', () => {
    expect(() => assertFitsColumn('name', 'N'.repeat(101), 100)).toThrow(BadRequestException);
  });

  it('takes a value as long as the column, counted in characters', () => {
    expect(() => assertFitsColumn('name', 'N'.repeat(100), 100)).not.toThrow();
    expect(fitsColumn(`${'N'.repeat(99)}${beyondBmp}`, 100)).toBe(true);
  });

  it.each([undefined, null, 12345])('leaves %p to the caller', value => {
    expect(fitsColumn(value, 3)).toBe(true);
  });

  it('cuts a value to the column without splitting a character', () => {
    expect(cutToColumn(`${'N'.repeat(99)}${beyondBmp}NN`, 100)).toBe(`${'N'.repeat(99)}${beyondBmp}`);
  });
});
