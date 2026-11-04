import {
  MetadataValuesEntry,
  ProfileValues,
  UnitMetadataValues
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

function fillEntryValueAsText(entry: MetadataValuesEntry, hideNumbering: boolean): MetadataValuesEntry {
  const { value } = entry;
  const isVocabulary = Array.isArray(value) &&
    value.some(item => !!item && typeof item === 'object' && 'id' in item);
  // Vocabulary display text is always recomputed so hideNumbering applies even
  // when a valueAsText was already stored (e.g. imported units); other value
  // types keep their stored valueAsText and are only backfilled when empty.
  if (isVocabulary) {
    return { ...entry, valueAsText: getEntryValueAsText(value, hideNumbering) };
  }
  const hasText = Array.isArray(entry.valueAsText) ? entry.valueAsText.length > 0 : !!entry.valueAsText;
  if (hasText) return entry;
  return { ...entry, valueAsText: getEntryValueAsText(value) };
}

function fillProfileValueAsText<T extends ProfileValues>(
  profile: T,
  hideNumberingByEntry: Record<string, boolean>
): T {
  if (!profile.entries) return profile;
  return {
    ...profile,
    entries: profile.entries.map(
      entry => fillEntryValueAsText(entry, hideNumberingByEntry[entry.id] ?? false)
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
 */
export function ensureValueAsText(
  metadata: UnitMetadataValues,
  hideNumbering: Record<string, Record<string, boolean>> = {}
): UnitMetadataValues {
  if (!metadata) return metadata;
  const forProfile = <T extends ProfileValues>(profile: T): T => fillProfileValueAsText(
    profile,
    hideNumbering[profile.profileId ?? ''] ?? {}
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
