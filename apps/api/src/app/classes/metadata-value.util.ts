import { LanguageCodedText } from '@iqbspecs/metadata-profile';

// Builds the display text of a vocabulary entry from its numbering and label.
// In metadata-values@3.x the spec field `annotation` holds the numbering (the
// vocabulary's SKOS notation) and `label` the pure term. The numbering is
// prepended per language, mirroring what the profile form renders when
// hideNumbering is off. Returns the labels unchanged when no numbering exists.
export function combineNotationAndLabel(
  annotation: LanguageCodedText[] | undefined,
  label: LanguageCodedText[] | undefined
): LanguageCodedText[] {
  const labels = label ?? [];
  const notation = annotation?.[0]?.value ?? '';
  if (!notation) return labels;
  return labels.map(text => ({ lang: text.lang, value: `${notation} ${text.value}`.trim() }));
}
