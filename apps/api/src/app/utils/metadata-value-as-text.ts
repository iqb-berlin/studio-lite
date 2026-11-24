import {
  MetadataValuesEntry,
  ProfileValues,
  UnitMetadataValues,
  VocabularyValueEntry
} from '@studio-lite-lib/api-dto';
import { LanguageCodedText } from '@iqbspecs/metadata-profile';
import { combineNotationAndLabel } from '../classes/metadata-value.util';

function getEntryValueAsText(
  value: MetadataValuesEntry['value'],
  hideNumbering = false
): MetadataValuesEntry['valueAsText'] {
  // metadata-values@3.x simple value { raw, asText } (form-created; the legacy
  // form stored a plain string instead and has no asText to recover).
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return (value as unknown as { asText?: MetadataValuesEntry['valueAsText'] }).asText ?? [];
  }
  if (!Array.isArray(value)) return [];
  if (value.some(item => item && typeof item === 'object' && 'id' in item)) {
    // vocabulary entries: metadata-values@3.x carries the pure label in `label`
    // (legacy internal form in `text`) and the numbering in `annotation`; the
    // display text combines numbering + label.
    return value.flatMap(item => {
      if (!item || typeof item !== 'object' || !('id' in item)) return [];
      const vocab = item as {
        label?: LanguageCodedText[]; text?: LanguageCodedText[]; annotation?: LanguageCodedText[];
      };
      const texts = vocab.label ?? vocab.text;
      return hideNumbering ? (texts ?? []) : combineNotationAndLabel(vocab.annotation, texts);
    }) as MetadataValuesEntry['valueAsText'];
  }
  // no vocabulary entries -> already multilingual free text
  return value as MetadataValuesEntry['valueAsText'];
}

/**
 * What a profile and its vocabulary bring for one field, in every language they have: its name, the
 * texts for yes and no, and the labels of its terms by id. The studio translates no metadata; it
 * only puts these texts in place of the copy that was stored with the values (#2207).
 */
export interface FieldTexts {
  label?: LanguageCodedText[];
  trueLabel?: LanguageCodedText[];
  falseLabel?: LanguageCodedText[];
  terms?: Record<string, LanguageCodedText[]>;
}

/** profileId -> entryId -> {@link FieldTexts} */
export type ProfileFieldTexts = Record<string, Record<string, FieldTexts>>;

function isVocabularyValue(value: MetadataValuesEntry['value']): value is VocabularyValueEntry[] {
  return Array.isArray(value) && value.some(item => !!item && typeof item === 'object' && 'id' in item);
}

// The raw value of a yes/no field: `{ raw, asText }` from the form, a plain string from the legacy form.
function rawOf(value: MetadataValuesEntry['value']): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return (value as unknown as { raw?: string }).raw;
  }
  return undefined;
}

function withFieldTexts(entry: MetadataValuesEntry, texts: FieldTexts): MetadataValuesEntry {
  const { terms } = texts;
  return {
    ...entry,
    label: texts.label?.length ? texts.label : entry.label,
    value: terms && isVocabularyValue(entry.value) ?
      entry.value.map(item => (item && terms[item.id]?.length ? { ...item, label: terms[item.id] } : item)) :
      entry.value
  };
}

function booleanText(entry: MetadataValuesEntry, texts: FieldTexts): LanguageCodedText[] | undefined {
  const text = ({ true: texts.trueLabel, false: texts.falseLabel } as Record<string, LanguageCodedText[] | undefined>)[
    rawOf(entry.value) ?? ''
  ];
  return text?.length ? text : undefined;
}

function fillEntryValueAsText(
  storedEntry: MetadataValuesEntry,
  hideNumbering: boolean,
  texts: FieldTexts
): MetadataValuesEntry {
  const entry = withFieldTexts(storedEntry, texts);
  const { value } = entry;
  // Vocabulary display text is always recomputed so hideNumbering applies even
  // when a valueAsText was already stored (e.g. imported units); other value
  // types keep their stored valueAsText and are only backfilled when empty.
  if (isVocabularyValue(value)) {
    return { ...entry, valueAsText: getEntryValueAsText(value, hideNumbering) };
  }
  const yesNo = booleanText(entry, texts);
  if (yesNo) return { ...entry, valueAsText: yesNo };
  const hasText = Array.isArray(entry.valueAsText) ? entry.valueAsText.length > 0 : !!entry.valueAsText;
  if (hasText) return entry;
  return { ...entry, valueAsText: getEntryValueAsText(value) };
}

function fillProfileValueAsText<T extends ProfileValues>(
  profile: T,
  hideNumberingByEntry: Record<string, boolean>,
  textsByEntry: Record<string, FieldTexts>
): T {
  if (!profile.entries) return profile;
  return {
    ...profile,
    entries: profile.entries.map(
      entry => fillEntryValueAsText(entry, hideNumberingByEntry[entry.id] ?? false, textsByEntry[entry.id] ?? {})
    )
  };
}

/**
 * Backfill a display text (valueAsText) for entries that have none, e.g. rows stored before
 * valueAsText was populated. Only structured values carry their own text: vocabulary entries hold
 * it in `text`, multilingual free text is already language-coded. A plain string cannot be
 * resolved here (a coded value needs its vocabulary, free text carries no language), so it is
 * left empty rather than guessed. Returns new objects; the stored entities are not mutated.
 *
 * `hideNumbering` maps profileId -> entryId -> true when that vocabulary field hides the
 * numbering. Empty (the default) keeps the numbering everywhere, which matches the behaviour
 * before hideNumbering was honoured server-side.
 *
 * `texts` holds what the stored profiles and vocabularies bring per field. Where it has a field's
 * name, a term's label or the text for yes or no, that replaces the stored copy, so metadata saved
 * in one language reads in every language the profile and vocabulary have. Where it has nothing,
 * the stored copy stays.
 */
export function ensureValueAsText(
  metadata: UnitMetadataValues,
  hideNumbering: Record<string, Record<string, boolean>> = {},
  texts: ProfileFieldTexts = {}
): UnitMetadataValues {
  if (!metadata) return metadata;
  const forProfile = <T extends ProfileValues>(profile: T): T => fillProfileValueAsText(
    profile,
    hideNumbering[profile.profileId ?? ''] ?? {},
    texts[profile.profileId ?? ''] ?? {}
  );
  return {
    ...metadata,
    ...(metadata.profiles && { profiles: metadata.profiles.map(forProfile) }),
    ...(metadata.items && {
      items: metadata.items.map(item => ({
        ...item,
        ...(item.profiles && { profiles: item.profiles.map(forProfile) })
      }))
    })
  };
}
