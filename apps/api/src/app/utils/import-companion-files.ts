import {
  ItemsMetadataValues,
  MetadataValuesEntry,
  ProfileValues,
  RequestReportDto,
  UnitCommentDto,
  UnitMetadataValues
} from '@studio-lite-lib/api-dto';
import { orderFromCurrent } from '@studio-lite/shared-code';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { FileIo } from '../interfaces/file-io.interface';
import { readXsdBoolean } from './xsd-boolean';
import {
  LanguageCodedText,
  MetadataEntryJson,
  MetadataValuesJson,
  UnitItemJson,
  UnitMetadataJson,
  VocabularyEntryJson
} from '../interfaces/unit-json-specs.interface';

/*
 * The companion files of an imported unit -- metadata, items, comments, and every other JSON file a
 * unit names -- read back onto the internal shapes. The XML and the JSON import name the same files,
 * so both go through these. Each mapping accepts the iqb specification and the older shape the
 * studio wrote before it.
 */

// A comment as found in an exported *.voco.json file. Supports both the iqb
// unit-comments@0.1 spec field names and the legacy ones for backwards compat.
export interface ImportedComment {
  id: number;
  body: string;
  commentator?: string;
  userName?: string;
  parentComment?: number | null;
  parentId?: number | null;
  isHidden?: boolean;
  hidden?: boolean;
  createdAt?: string;
  changedAt?: string;
  itemUuids?: string[];
}

// Parses a companion JSON file (vocs/voco/vorn/vomd/voit/vova). A broken
// file must not abort the whole upload: report a json-parse warning for
// the file and import the unit without this block.
export function parseCompanionJson<T>(
  file: FileIo,
  functionReturn: RequestReportDto
): T | undefined {
  try {
    return JSON.parse(file.buffer.toString()) as T;
  } catch {
    functionReturn.messages.push({
      objectKey: file.originalname,
      messageKey: 'unit-upload.api-warning.json-parse'
    });
    return undefined;
  }
}

// Reconstructs the internal entry shape (value/valueAsText) from the three
// metadata-values@3.0 value forms: simple_value, vocabulary_entries and
// language_coded_texts. Vocabulary labels become both the internal `text`
// and the display texts in valueAsText.
function mapMetadataEntryJson(entry: MetadataEntryJson): MetadataValuesEntry {
  const { value } = entry;
  let internalValue: MetadataValuesEntry['value'] = '';
  let valueAsText: LanguageCodedText[] = [];
  if (Array.isArray(value)) {
    if (value.some(entryValue => !!entryValue && typeof (entryValue as VocabularyEntryJson).id === 'string')) {
      const vocabularyEntries = value as VocabularyEntryJson[];
      // Preserve the spec field `annotation` (the numbering / SKOS notation);
      // the pure label stays in `text`. valueAsText is left empty here because
      // the read path (ensureValueAsText) always recomputes the
      // vocabulary display text, honouring hideNumbering — computing it now
      // would only be overwritten.
      internalValue = vocabularyEntries.map(vocabularyEntry => ({
        id: vocabularyEntry.id,
        text: vocabularyEntry.label ?? [],
        annotation: vocabularyEntry.annotation ?? []
      }));
      valueAsText = [];
    } else {
      internalValue = value as LanguageCodedText[];
      valueAsText = value as LanguageCodedText[];
    }
  } else if (value && typeof value === 'object' && typeof value.raw === 'string') {
    internalValue = value.raw;
    valueAsText = value.asText ?? [];
  }
  return {
    id: entry.id,
    label: entry.label ?? [],
    value: internalValue,
    valueAsText
  };
}

// Maps metadata-values@3.0 profiles back onto the internal structure. The
// profile `order` is carried through; setCurrentProfiles reasserts it against
// the workspace profile settings during import.
export function mapMetadataValuesJson(
  values: MetadataValuesJson[]
): { profileId: string; order?: number; entries: MetadataValuesEntry[] }[] {
  return (values ?? [])
    .filter(profile => !!profile?.profileId)
    .map(profile => ({
      profileId: profile.profileId,
      order: profile.order,
      entries: (profile.entries ?? [])
        .filter(entry => !!entry?.id)
        .map(entry => mapMetadataEntryJson(entry))
    }));
}

// Legacy raw-blob exports predate the metadata-values@3.x `order` field and
// carry the obsolete boolean `isCurrent` on each profile. Derive `order` from
// it (true -> 0, false -> -1) and drop the flag so the imported structure
// matches the current model. A profile that already carries `order` keeps it.
// Profile ids are left as imported; UnitMetadataService.setCurrentProfiles rewrites the
// legacy github spelling to w3id on the way to persistence (#1570).
function normalizeLegacyProfileOrder(metadata: UnitMetadataValues): UnitMetadataValues {
  if (!metadata || typeof metadata !== 'object') return metadata;
  const mapProfile = (profile: ProfileValues & { isCurrent?: boolean }): ProfileValues => {
    const { isCurrent, ...rest } = profile;
    return { ...rest, order: profile.order ?? orderFromCurrent(!!isCurrent) };
  };
  return {
    ...metadata,
    ...(metadata.profiles && { profiles: metadata.profiles.map(mapProfile) }),
    ...(metadata.items && {
      items: metadata.items.map(item => ({
        ...item,
        ...(item.profiles && { profiles: item.profiles.map(mapProfile) })
      }))
    })
  };
}

/**
 * Maps metadata from an exported *.vomd.json back onto the internal structure. Detects the iqb
 * unit-metadata@0.1 wrapper ({ metadata: [...] }) and falls back to the legacy raw
 * { profiles, items } blob for backwards compatibility.
 */
export function mapImportedMetadata(parsed: unknown): UnitMetadataValues {
  const wrapper = parsed as UnitMetadataJson;
  if (Array.isArray(wrapper?.metadata)) {
    return {
      profiles: mapMetadataValuesJson(wrapper.metadata)
    };
  }
  return normalizeLegacyProfileOrder((parsed ?? {}) as UnitMetadataValues);
}

/**
 * Maps items from the iqb unit-items@0.2 spec shape back onto the internal structure:
 * sourceVariableId/sourceVariableUuid become variableId/variableReadOnlyId. Items without the
 * required id are dropped (mirrors transformItems on export); they would otherwise end up as
 * unaddressable NULL-id rows in unit_item.
 */
export function mapImportedItems(items: UnitItemJson[]): ItemsMetadataValues[] {
  return (Array.isArray(items) ? items : [])
    .filter(item => !!item?.id)
    .map(item => ({
      uuid: item.uuid,
      id: item.id,
      description: item.description,
      order: item.order,
      variableId: item.sourceVariableId ?? null,
      variableReadOnlyId: item.sourceVariableUuid ?? null,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      changedAt: item.changedAt ? new Date(item.changedAt) : undefined,
      profiles: mapMetadataValuesJson(item.metadata ?? [])
    }));
}

/**
 * The variables of an imported *.vova.json, kept as sent (#1708) but for `valuesComplete`: up to #1987
 * the XML import took that attribute over as text, and JSON exports of such units carry it so.
 */
export function mapImportedVariables(variables: VariableInfo[] | undefined): VariableInfo[] {
  return (Array.isArray(variables) ? variables : []).map(variable => {
    const valuesComplete: unknown = variable?.valuesComplete;
    if (typeof valuesComplete !== 'string') return variable;
    return { ...variable, valuesComplete: readXsdBoolean(valuesComplete) };
  });
}

// Maps a comment from the iqb unit-comments@0.1 spec shape (commentator/
// isHidden/parentComment) back onto the internal DTO, accepting the legacy
// field names (userName/hidden/parentId) for backwards compatibility.
export function mapImportedComment(comment: ImportedComment): UnitCommentDto {
  return {
    id: comment.id,
    body: comment.body,
    userName: comment.commentator ?? comment.userName ?? '',
    // User IDs from another instance are unreliable and could randomly collide with local IDs.
    // We therefore set them to -1 during import to ensure comments are marked as unread for all local users.
    userId: -1,
    parentId: comment.parentComment ?? comment.parentId ?? null,
    hidden: comment.isHidden ?? comment.hidden ?? false,
    createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
    changedAt: comment.changedAt ? new Date(comment.changedAt) : undefined,
    itemUuids: comment.itemUuids
  };
}
