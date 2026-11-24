import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

type Text = { lang: string; value: string };

/**
 * The text in the given language, else the first there is. The studio translates no metadata: a
 * profile or vocabulary without that language stays in the language it brings (#2207).
 */
export function textIn(texts: Text[] | string | null | undefined, language: string): string {
  if (typeof texts === 'string') return texts;
  if (!texts?.length) return '';
  return (texts.find(text => text.lang === language) ?? texts[0]).value;
}

function isTerm(item: unknown): boolean {
  return !!item && typeof item === 'object' && 'id' in item;
}

/**
 * The display texts of a field in one language. `valueAsText` lists every term of a vocabulary field
 * in every language its vocabulary has, one after another, so the language is chosen for the whole
 * field: the given one if every value has it, else the language of the first text if every value
 * has that, else all texts -- a term is never left out. The values of a field are its terms, or the
 * one value of any other field.
 */
export function valueTextsIn(
  entry: Pick<MetadataValuesEntry, 'value' | 'valueAsText'>,
  language: string
): Text[] {
  const texts: Text[] = entry.valueAsText ? ([] as Text[]).concat(entry.valueAsText) : [];
  const terms = Array.isArray(entry.value) ? (entry.value as unknown[]).filter(isTerm).length : 0;
  const values = Math.max(terms, 1);
  const inLanguage = (lang: string) => texts.filter(text => text.lang === lang);
  const everyValueHas = (lang: string | undefined) => !!lang && inLanguage(lang).length >= values;
  if (everyValueHas(language)) return inLanguage(language);
  if (everyValueHas(texts[0]?.lang)) return inLanguage(texts[0].lang);
  return texts;
}
