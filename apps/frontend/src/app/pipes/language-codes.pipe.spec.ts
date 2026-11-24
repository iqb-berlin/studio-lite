import { LanguageCodesPipe } from './language-codes.pipe';

describe('LanguageCodesPipe', () => {
  it.each([
    [['de', 'en'], 'de, en'],
    [['de'], 'de'],
    [[], ''],
    [undefined, '']
  ])('shows %p as "%s"', (codes, expected) => {
    expect(new LanguageCodesPipe().transform(codes)).toBe(expected);
  });
});
