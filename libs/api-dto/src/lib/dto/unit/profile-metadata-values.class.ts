// eslint-disable-next-line max-classes-per-file
import { TextsWithLanguageAndId } from '@iqb/metadata/md-values';
import { TextWithLanguage } from '@iqb/metadata/md-main';

export class ProfileMetadataValues {
  profiles?: MetadataValues[];
}

export class UnitMetadataValues extends ProfileMetadataValues {
  items?: ItemsMetadataValues[];
}

export class MetadataValues {
  entries?: MetadataValuesEntry[];
  profileId?: string;
  isCurrent?: boolean;
}

export class ItemsMetadataValues extends ProfileMetadataValues {
  id?: string;
  description?: string;
  variableId?: string;
  variableReadOnlyId?: string;
  weighting?: number;
  [key: string]: string | number | MetadataValues[] | undefined;
}

export class MetadataValuesEntry {
  id!: string;
  label!: TextWithLanguage[];
  value!: TextsWithLanguageAndId[] | TextWithLanguage[] | string;
  valueAsText!: TextWithLanguage | TextWithLanguage[];
}
