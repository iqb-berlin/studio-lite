/** A tree of translations: a key is either a text or another map of keys. */
export type TranslationMap = Record<string, unknown>;

/** Whether a value is a nested key rather than a leaf; an array counts as a leaf. */
const isTranslationMap = (value: unknown): value is TranslationMap => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

/**
 * Lays one set of translations over another, nested keys included: what the overrides name wins,
 * everything else keeps the base's text. That is how a bundled library's translations can be
 * corrected from the studio's own files without copying the whole set.
 */
export const mergeTranslations = (
  base: TranslationMap,
  overrides: TranslationMap
): TranslationMap => {
  const merged = { ...base };
  Object.entries(overrides).forEach(([key, override]) => {
    const baseValue = merged[key];
    merged[key] = isTranslationMap(baseValue) && isTranslationMap(override) ?
      mergeTranslations(baseValue, override) :
      override;
  });
  return merged;
};

/**
 * Picks the translations for a language, trying the full tag first (`de-CH`), then the language
 * alone (`de`), then the fallback. A language nothing is known about yields an empty set rather
 * than an error -- untranslated keys show as keys, which is a legible failure.
 */
export const selectTranslationsForLanguage = (
  language: string,
  translationsByLanguage: Record<string, TranslationMap>,
  fallbackLanguage = 'de'
): TranslationMap => {
  const normalizedLanguage = language.trim().toLowerCase();
  const baseLanguage = normalizedLanguage.split('-')[0];
  const candidates = [normalizedLanguage, baseLanguage, fallbackLanguage]
    .filter((candidate, index, languages) => (
      candidate && languages.indexOf(candidate) === index
    ));
  const selectedLanguage = candidates.find(candidate => (
    Object.prototype.hasOwnProperty.call(translationsByLanguage, candidate)
  ));

  return selectedLanguage ? translationsByLanguage[selectedLanguage] : {};
};
