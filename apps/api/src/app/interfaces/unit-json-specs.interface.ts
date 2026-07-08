// Shapes of the unit JSON interchange files as defined by the iqb
// specifications (https://github.com/iqb-specifications): metadata-values@3.0
// (*.vomd.json/*.voit.json payload), unit-metadata@0.1 (*.vomd.json wrapper)
// and unit-items@0.2 (*.voit.json). Used by both the export
// (unit-download.class.ts) and the import (workspace.service.ts) so the two
// sides cannot drift apart.
//
// The metadata-values value shapes below are hand-declared instead of being
// imported from @iqbspecs/metadata-values. They mirror the 3.0.2 package
// interfaces field for field (order/label/annotation/asText optional, empty
// arrays allowed — the 3.0.1 interface/schema mismatch was fixed in 3.0.2,
// see iqb-specifications/metadata-values#1). We cannot bump the dependency to
// 3.0.2 yet because @iqb/metadata-components (<= 0.2.4) pins its peer
// dependency to metadata-values exactly 3.0.1, so bumping the root to 3.0.2
// breaks `npm ci`. Once metadata-components widens that peer range, replace
// these declarations with re-exports of the package types (VocabularyEntry,
// SimpleValue, MetadataValue, MetadataProfileValues) — tracked in
// iqb-berlin/studio-lite#1514, blocked by iqb-berlin/metadata-components#10.
// LanguageCodedText is unaffected (lang and value are genuinely required), so
// it is reused from the metadata-profile spec package that the repo already
// imports elsewhere.
import { LanguageCodedText } from '@iqbspecs/metadata-profile';

export type { LanguageCodedText };

// Name of the report file a JSON export adds to the zip when spec mapping
// had to drop content. Shared between the export (writer) and the import
// (accepts it silently). The leading underscore keeps it collision-free:
// unit keys must start with a letter, so no unit index file (`${key}.json`)
// can ever claim this name.
export const EXPORT_REPORT_FILENAME = '_export-report.json';

// All objects have additionalProperties: false, so internal-only fields must
// be dropped on export.

export interface VocabularyEntryJson {
  id: string;
  label?: LanguageCodedText[];
  annotation?: LanguageCodedText[];
}

export interface SimpleValueJson {
  raw: string;
  asText?: LanguageCodedText[];
}

export type MetadataValueJson = LanguageCodedText[] | VocabularyEntryJson[] | SimpleValueJson;

export interface MetadataEntryJson {
  id: string;
  label?: LanguageCodedText[];
  value: MetadataValueJson;
}

export interface MetadataValuesJson {
  profileId: string;
  order?: number;
  entries: MetadataEntryJson[];
}

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
