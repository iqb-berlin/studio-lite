import { byteLength, definitionSizeLevel } from './definition-size.utils';

describe('definitionSizeLevel', () => {
  const KB = 1024;
  const MB = 1024 * KB;

  it.each([
    [1, 'small'],
    [200 * KB - 1, 'small'],
    [200 * KB, 'medium'],
    [MB - 1, 'medium'],
    [MB, 'large'],
    [5 * MB - 1, 'large'],
    [5 * MB, 'very-large'],
    [50 * MB, 'very-large']
  ])('names %d bytes %s', (bytes, level) => {
    expect(definitionSizeLevel(bytes)).toBe(level);
  });
});

describe('byteLength', () => {
  // the database counts bytes, and the card compares the editor's count with it (#2197)
  it('counts bytes in UTF-8, not characters', () => {
    expect(byteLength('abc')).toBe(3);
    expect(byteLength('Größe')).toBe(7);
    expect(byteLength('😀')).toBe(4);
  });

  it('counts nothing for no text', () => {
    expect(byteLength('')).toBe(0);
    expect(byteLength(undefined)).toBe(0);
  });
});
