import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { textIn, valueTextsIn } from './metadata-language.utils';

const de = (value: string) => ({ lang: 'de', value });
const en = (value: string) => ({ lang: 'en', value });
const italian = (value: string) => ({ lang: 'it', value });
const terms = (...ids: string[]) => ids.map(id => ({ id })) as MetadataValuesEntry['value'];

describe('textIn', () => {
  it.each([
    ['the language asked for', [de('Klassenstufe'), en('Grade level')], 'en', 'Grade level'],
    ['the first text without that language', [italian('Livello'), de('Klassenstufe')], 'en', 'Livello'],
    ['nothing without texts', [], 'en', '']
  ])('takes %s', (_, texts, language, expected) => {
    expect(textIn(texts, language)).toBe(expected);
  });
});

// The texts of a field shown in print, review and the report (#2207).
describe('valueTextsIn', () => {
  it('shows every term once, in the language asked for', () => {
    const entry = {
      value: terms('dt/1', 'dt/3'),
      valueAsText: [de('Kompetenzdaten'), en('Skills data'), de('Umfragedaten'), en('Survey data')]
    };

    expect(valueTextsIn(entry, 'en')).toEqual([en('Skills data'), en('Survey data')]);
    expect(valueTextsIn(entry, 'de')).toEqual([de('Kompetenzdaten'), de('Umfragedaten')]);
  });

  it('keeps every term when one of them lacks the language asked for', () => {
    const entry = {
      value: terms('dt/1', 'dt/3'),
      valueAsText: [de('Kompetenzdaten'), en('Skills data'), de('Umfragedaten')]
    };

    expect(valueTextsIn(entry, 'en')).toEqual([de('Kompetenzdaten'), de('Umfragedaten')]);
  });

  it('shows metadata only in another language as they are', () => {
    const entry = { value: terms('x/1'), valueAsText: [italian('Longitudinale')] };

    expect(valueTextsIn(entry, 'en')).toEqual([italian('Longitudinale')]);
  });

  it.each([
    ['a yes/no field', { raw: 'true' }, [de('ja'), en('yes')], 'en', [en('yes')]],
    ['free text with a version per language', [de('Studie'), en('Study')], [de('Studie'), en('Study')], 'en',
      [en('Study')]],
    ['free text in one language', [en('Study')], [en('Study')], 'de', [en('Study')]],
    ['a single text without a list', 'Studie', de('Studie'), 'de', [de('Studie')]]
  ])('takes one text for %s', (_, value, valueAsText, language, expected) => {
    const entry = { value, valueAsText } as unknown as MetadataValuesEntry;

    expect(valueTextsIn(entry, language)).toEqual(expected);
  });
});
