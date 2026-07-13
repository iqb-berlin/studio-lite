// Shapes of the unit JSON interchange files as defined by the iqb
// specifications (https://github.com/iqb-specifications): metadata-values@3.0
// (*.vomd.json/*.voit.json payload), unit-metadata@0.1 (*.vomd.json wrapper)
// and unit-items@0.2 (*.voit.json). Used by both the export
// (unit-download.class.ts) and the import (workspace.service.ts) so the two
// sides cannot drift apart.
//
// The metadata-values value shapes are aliased from @iqbspecs/metadata-values
// under the *Json names this module uses throughout. LanguageCodedText is
// taken from the metadata-profile spec package that the repo already imports
// elsewhere; the two declarations are structurally identical.
import { LanguageCodedText } from '@iqbspecs/metadata-profile';
import {
  MetadataProfileValues, MetadataValue, SimpleValue, VocabularyEntry
} from '@iqbspecs/metadata-values';

export type { LanguageCodedText };

export type VocabularyEntryJson = VocabularyEntry;
export type SimpleValueJson = SimpleValue;
export type MetadataEntryJson = MetadataValue;
export type MetadataValueJson = MetadataValue['value'];
export type MetadataValuesJson = MetadataProfileValues;

// Name of the report file a JSON export adds to the zip when spec mapping
// had to drop content. Shared between the export (writer) and the import
// (accepts it silently). The leading underscore keeps it collision-free:
// unit keys must start with a letter, so no unit index file (`${key}.json`)
// can ever claim this name.
export const EXPORT_REPORT_FILENAME = '_export-report.json';

// All objects have additionalProperties: false, so internal-only fields must
// be dropped on export.

// Unit metadata shape as defined by the iqb unit-metadata@0.1 specification
// (https://github.com/iqb-specifications/unit-metadata).
export interface UnitMetadataJson {
  createdAt?: string;
  changedAt?: string;
  metadata?: MetadataValuesJson[];
}

// Item shape as defined by the iqb unit-items@0.2 specification
// (https://github.com/iqb-specifications/unit-items). Fields without a
// counterpart in the spec are intentionally dropped on export.
export interface UnitItemJson {
  uuid?: string;
  id: string;
  description?: string;
  order?: number;
  sourceVariableId?: string;
  sourceVariableUuid?: string;
  createdAt?: string;
  changedAt?: string;
  metadata?: MetadataValuesJson[];
}

// Reference from the unit index to a companion file of the unit.
export interface ExternalDataBlock {
  id: string;
  type: string;
  modifiedAt?: string;
}

export interface UserInterfaceBlock {
  player: string;
  editor?: string;
  definition?: string;
  isDefinitionInline?: boolean;
  modifiedAt?: string;
}

// Unit index shape as defined by the iqb unit-index specification
// (https://github.com/iqb-specifications/unit-index) — the `${key}.json`
// entry file of each exported unit.
export interface UnitIndexJson {
  id: string;
  uuid?: string;
  modifiedAt?: string;
  label?: string;
  description?: string;
  userInterface: UserInterfaceBlock;
  codingScheme?: ExternalDataBlock;
  comments?: ExternalDataBlock;
  richNotes?: ExternalDataBlock;
  metadata?: ExternalDataBlock;
  items?: ExternalDataBlock;
  variables?: ExternalDataBlock;
}
