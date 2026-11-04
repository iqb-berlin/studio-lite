import { ProfileValues, UnitMetadataValues, MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { LanguageCodedText } from '../interfaces/unit-json-specs.interface';
import { combineNotationAndLabel } from './metadata-value.util';

/**
 * The metadata of a unit in the form the XML export has always written to `.vomd`: profiles and
 * items as stored, with the numbering of vocabulary entries folded back into their texts. The
 * shape is frozen -- readers of old exports depend on it.
 */
export class LegacyMetadataDownloadClass {
  /**
   * The legacy XML export writes the internal metadata blob (`${key}.vomd`) as-is.
   * metadata-values@3.x split the vocabulary numbering off the label into a separate `annotation`
   * field — a JSON-export concern. To keep the .vomd blob exactly as legacy consumers expect, fold
   * the split back before serializing: when the field shows numbering, merge it into the display
   * text; when it hides numbering (hideNumbering), keep the pure label — matching the shape the old
   * form baked at save time. Only vocabulary values are touched.
   */
  static toLegacyMetadataBlob(
    metadata: UnitMetadataValues,
    hideNumbering: Record<string, Record<string, boolean>> = {}
  ): UnitMetadataValues {
    if (!metadata || typeof metadata !== 'object') return metadata;
    const foldProfile = <T extends ProfileValues>(profile: T): T => LegacyMetadataDownloadClass.foldProfileAnnotations(
      profile,
      hideNumbering[profile.profileId ?? ''] ?? {}
    );
    return {
      ...metadata,
      ...(metadata.profiles && { profiles: metadata.profiles.map(foldProfile) }),
      ...(metadata.items && {
        items: metadata.items.map(item => ({
          ...item,
          ...(item.profiles && { profiles: item.profiles.map(foldProfile) })
        }))
      })
    };
  }

  private static foldProfileAnnotations<T extends ProfileValues>(
    profile: T,
    hideNumberingByEntry: Record<string, boolean>
  ): T {
    if (!profile?.entries) return profile;
    return {
      ...profile,
      entries: profile.entries.map(
        entry => LegacyMetadataDownloadClass.foldEntryAnnotation(entry, hideNumberingByEntry[entry.id] ?? false)
      )
    };
  }

  private static foldEntryAnnotation(entry: MetadataValuesEntry, hideNumbering: boolean): MetadataValuesEntry {
    const { value } = entry;
    if (!Array.isArray(value) || !value.some(item => !!item && typeof item === 'object' && 'id' in item)) {
      return entry;
    }
    return {
      ...entry,
      value: value.map(item => LegacyMetadataDownloadClass.foldVocabValueToLegacy(item, hideNumbering)) as
        MetadataValuesEntry['value']
    };
  }

  // Restores the pre-split shape: form-created entries kept the text in `label`
  // (with an empty `annotation`), imported entries in `text` (without
  // `annotation`). The numbering is merged back only when it is shown; with
  // hideNumbering the pure label is kept, exactly as the old form stored it.
  private static foldVocabValueToLegacy(item: unknown, hideNumbering: boolean): unknown {
    if (!item || typeof item !== 'object' || !('id' in item)) return item;
    const entry = item as {
      id: string; label?: LanguageCodedText[]; text?: LanguageCodedText[]; annotation?: LanguageCodedText[];
    };
    if (entry.label !== undefined) {
      const label = hideNumbering ? entry.label : combineNotationAndLabel(entry.annotation, entry.label);
      return { id: entry.id, label, annotation: [] };
    }
    if (entry.text !== undefined) {
      const text = hideNumbering ? entry.text : combineNotationAndLabel(entry.annotation, entry.text);
      return { id: entry.id, text };
    }
    return item;
  }
}
