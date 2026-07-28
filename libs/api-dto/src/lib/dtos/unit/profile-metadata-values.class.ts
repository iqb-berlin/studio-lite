// eslint-disable-next-line max-classes-per-file
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';

export class ProfileMetadataValues {
  profiles?: ProfileValues[];
}

export class UnitMetadataValues extends ProfileMetadataValues {
  items?: ItemsMetadataValues[];
}

export class ProfileValues {
  entries?: MetadataValuesEntry[];
  profileId?: string;
  // metadata-values@3.x profile order: -1 = hidden/disabled, >= 0 = position.
  // Replaces the legacy `isCurrent` boolean.
  order?: number;
}

export class ItemsMetadataValues extends ProfileMetadataValues {
  uuid?: string;
  order?: number;
  unitId?: number;
  createdAt?: Date;
  changedAt?: Date;
  id?: string;
  description?: string;
  variableId?: string | null;
  variableReadOnlyId?: string | null;
  [key: string]: string | number | ProfileValues[] | null | undefined | boolean | Date;
}

// Internal vocabulary value entry. The display text lives in `label`
// (form-created) or `text` (imported/legacy), the numbering in `annotation` —
// the spec field `annotation` holds what the vocabulary exposes as its SKOS
// notation.
export interface VocabularyValueEntry {
  id: string;
  label?: TextWithLanguage[];
  text?: TextWithLanguage[];
  annotation?: TextWithLanguage[];
}

export class MetadataValuesEntry {
  id!: string;
  label!: TextWithLanguage[];
  value!: VocabularyValueEntry[] | TextWithLanguage[] | string;
  valueAsText!: TextWithLanguage | TextWithLanguage[];
}
