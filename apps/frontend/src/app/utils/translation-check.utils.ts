export type TranslationTexts = { [key: string]: string | TranslationTexts };

export interface TranslationDifferences {
  /** Keys of the source that the translation lacks: they would show as their key. */
  missing: string[];
  /** Keys only the translation has: left over from a text that is gone. */
  extra: string[];
  /** Keys whose `{{…}}` placeholders differ: a value would stay unfilled or vanish. */
  placeholders: string[];
  /**
   * Keys whose text starts or ends with other white space: templates put such texts next to
   * others, and a lost space glues two words together.
   */
  whitespace: string[];
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

const edgesOf = (text: string): string => `${/^\s*/.exec(text)?.[0]}|${/\s*$/.exec(text)?.[0]}`;

/**
 * Where a translation file differs from the file it is translated from, key by key (#2174). A
 * language is offered only when nothing differs.
 */
export function compareTranslations(source: TranslationTexts, translation: TranslationTexts): TranslationDifferences {
  const sourceTexts = flatten(source);
  const translatedTexts = flatten(translation);
  const differingIn = (aspect: (text: string) => string): string[] => [...sourceTexts]
    .filter(([key, text]) => translatedTexts.has(key) && aspect(text) !== aspect(translatedTexts.get(key) as string))
    .map(([key]) => key);
  return {
    missing: [...sourceTexts.keys()].filter(key => !translatedTexts.has(key)),
    extra: [...translatedTexts.keys()].filter(key => !sourceTexts.has(key)),
    placeholders: differingIn(placeholdersOf),
    whitespace: differingIn(edgesOf)
  };
}

// A key in quotes right before the translate pipe, or as the first argument of instant() or stream(). A quoted piece
// after a `+` is the end of a key put together at runtime, which only the running page knows.
const QUOTED_KEYS = [
  /(?<!\+\s*)['"]([\w.-]+)['"]\s*\|\s*translate\b/g,
  /\b(?:instant|stream)\(\s*['"]([\w.-]+)['"]/g
];

/**
 * The keys that templates and components name in quotes but the texts lack: the page would show the key itself
 * (#2231). Not seen are keys put together at runtime, keys chosen in a condition (`(a ? 'x.y' : 'x.z') | translate`),
 * keys asked for as a list (`get([...])`) and keys kept in a field or a constant before they reach the pipe.
 */
export function missingTranslationKeys(texts: TranslationTexts, sources: string[]): string[] {
  const known = flatten(texts);
  const named = new Set(sources.flatMap(source => QUOTED_KEYS
    .flatMap(pattern => [...source.matchAll(pattern)].map(match => match[1]))));
  return [...named].filter(key => !known.has(key));
}
