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
