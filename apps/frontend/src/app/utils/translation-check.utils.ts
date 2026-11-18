export type TranslationTexts = { [key: string]: string | TranslationTexts };

export interface TranslationDifferences {
  /** Keys of the source that the translation lacks: they would show as their key. */
  missing: string[];
  /** Keys only the translation has: left over from a text that is gone. */
  extra: string[];
  /** Keys whose `{{…}}` placeholders differ: a value would stay unfilled or vanish. */
  placeholders: string[];
}

const flatten = (texts: TranslationTexts, prefix = ''): Map<string, string> => new Map(
  Object.entries(texts).flatMap(([key, value]) => (typeof value === 'string' ?
    [[`${prefix}${key}`, value] as [string, string]] :
    [...flatten(value, `${prefix}${key}.`)]))
);

const placeholdersOf = (text: string): string => (text.match(/{{\s*[\w.]+\s*}}/g) ?? [])
  .map(placeholder => placeholder.replace(/\s/g, ''))
  .sort()
  .join();

/**
 * Where a translation file differs from the file it is translated from, key by key (#2174). A
 * language is offered only when nothing differs.
 */
export function compareTranslations(source: TranslationTexts, translation: TranslationTexts): TranslationDifferences {
  const sourceTexts = flatten(source);
  const translatedTexts = flatten(translation);
  return {
    missing: [...sourceTexts.keys()].filter(key => !translatedTexts.has(key)),
    extra: [...translatedTexts.keys()].filter(key => !sourceTexts.has(key)),
    placeholders: [...sourceTexts]
      .filter(([key, text]) => translatedTexts.has(key) &&
        placeholdersOf(text) !== placeholdersOf(translatedTexts.get(key) as string))
      .map(([key]) => key)
  };
}
