import {
  MetadataValuesEntry, UnitExportContentsDto, UnitMetadataValues
} from '@studio-lite-lib/api-dto';
import type { UnitService } from '../services/unit.service';
import type { UnitCommentService } from '../services/unit-comment.service';
import type { UnitRichNoteService } from '../services/unit-rich-note.service';

/*
 * What counts as content of an optional export file. The export writes a file only when its
 * question here is answered yes, and the export dialog offers a file only when one of the chosen
 * units answers yes -- both ask in the same words, so the dialog cannot offer a file the export
 * then leaves out.
 */

/**
 * An entry that carries something: a non-empty simple value (a plain string, a number or boolean
 * from an untyped legacy row, or the metadata-values@3.x `{ raw }` form) or a non-empty value list.
 * Entries with empty values vanish from the export silently, since nothing is lost.
 */
export function entryHasContent(entry?: MetadataValuesEntry): boolean {
  if (!entry) return false;
  const value: unknown = entry.value;
  if (typeof value === 'string') return value !== '';
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  return !!value && typeof value === 'object' && !!(value as { raw?: unknown }).raw;
}

/**
 * Unit metadata with content: a profile entry with content, or keys of a pre-profile legacy shape.
 * The XML export writes the latter as they are; the JSON export cannot carry them and reports
 * their loss. knownMetadataKeys is checked against UnitMetadataValues so a new field on the
 * internal shape fails compilation here instead of being taken for legacy content.
 */
export function hasMetadataContent(metadata?: UnitMetadataValues | null): boolean {
  if (!metadata) return false;
  if ((metadata.profiles ?? []).some(
    profile => (profile?.entries ?? []).some(entry => entryHasContent(entry))
  )) return true;
  const knownMetadataKeys = { profiles: true, items: true } satisfies Record<keyof UnitMetadataValues, boolean>;
  return Object.keys(metadata).some(key => !(key in knownMetadataKeys));
}

/** At least one item with the id both formats require. */
export function hasItems(metadata?: UnitMetadataValues | null): boolean {
  return (metadata?.items ?? []).some(item => !!item?.id);
}

export function hasCodingScheme(scheme?: string | null): boolean {
  return !!scheme;
}

/**
 * For every unit of the workspace, which optional export files it would fill. Metadata, items and
 * the coding scheme are read from the unit itself; comments and rich notes are asked for all units
 * at once.
 */
export async function findUnitExportContents(
  workspaceId: number,
  unitService: UnitService,
  unitCommentService: UnitCommentService,
  unitRichNoteService: UnitRichNoteService
): Promise<UnitExportContentsDto[]> {
  const units = await unitService.findAllExportSources(workspaceId);
  const unitIds = units.map(unit => unit.id);
  const [unitsWithComments, unitsWithRichNotes] = await Promise.all([
    unitCommentService.findUnitIdsWithComments(unitIds),
    unitRichNoteService.findUnitIdsWithNotes(unitIds)
  ]);
  return units.map(unit => ({
    unitId: unit.id,
    metadata: hasMetadataContent(unit.metadata),
    items: hasItems(unit.metadata),
    codingScheme: hasCodingScheme(unit.scheme),
    comments: unitsWithComments.has(unit.id),
    richNotes: unitsWithRichNotes.has(unit.id)
  }));
}
