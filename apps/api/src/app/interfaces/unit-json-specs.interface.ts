// Shapes of the unit JSON interchange files as defined by the iqb
// specifications (https://github.com/iqb-specifications): metadata-values@3.0
// (*.vomd.json/*.voit.json payload), unit-metadata@0.1 (*.vomd.json wrapper)
// and unit-items@0.2 (*.voit.json). Used by both the export
// (unit-download.class.ts) and the import (workspace.service.ts) so the two
// sides cannot drift apart.
//
// Deliberately NOT imported from @iqbspecs/metadata-values: its interfaces
// contradict the normative JSON schema of the same spec — they declare
// `order`, `label`, `annotation` and `asText` as required although the schema
// lists none of them under `required`, and `minItems: 1` even forbids the
// empty arrays the package types would suggest. Switch to the package types
// once that is fixed upstream.

// All objects have additionalProperties: false, so internal-only fields must
// be dropped on export.
export interface LanguageCodedText {
  lang: string;
  value: string;
}

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
