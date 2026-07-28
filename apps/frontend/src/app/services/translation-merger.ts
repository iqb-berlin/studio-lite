export type TranslationMap = Record<string, unknown>;

const isTranslationMap = (value: unknown): value is TranslationMap => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

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
