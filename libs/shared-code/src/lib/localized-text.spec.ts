import { textIn, toLocalizedText } from './localized-text';

describe('toLocalizedText (#2186)', () => {
  it('takes a text stored before the languages as the German one', () => {
    expect(toLocalizedText('<p>Willkommen</p>')).toEqual({ de: '<p>Willkommen</p>' });
  });

  it('keeps the texts of every language and drops what is not text', () => {
    expect(toLocalizedText({
      de: 'Studio', en: 'Studio', fr: 3, it: null
    })).toEqual({ de: 'Studio', en: 'Studio' });
  });

  it('gives no text for nothing stored', () => {
    expect(toLocalizedText(undefined)).toEqual({});
    expect(toLocalizedText(null)).toEqual({});
  });
});

describe('textIn (#2186)', () => {
  it('gives the text in the language asked for', () => {
    expect(textIn({ de: 'Impressum', en: 'Imprint' }, 'en')).toBe('Imprint');
  });

  it('gives the German text where the language has none or an empty one', () => {
    expect(textIn({ de: 'Impressum' }, 'en')).toBe('Impressum');
    expect(textIn({ de: 'Impressum', en: '' }, 'en')).toBe('Impressum');
  });

  it('gives an empty text where German is empty as well', () => {
    expect(textIn({ de: '', en: '' }, 'en')).toBe('');
    expect(textIn(undefined, 'de')).toBe('');
  });
});
