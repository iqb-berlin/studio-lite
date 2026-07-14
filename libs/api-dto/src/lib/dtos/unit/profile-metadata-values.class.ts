// eslint-disable-next-line max-classes-per-file
import { TextWithLanguageAndId as TextsWithLanguageAndId } from '@iqb/metadata-resolver';
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
  isCurrent?: boolean;
}

export class ItemsMetadataValues extends ProfileMetadataValues {
  uuid?: string;
  order?: number;
  position?: string;
  locked?: boolean;
  unitId?: number;
  createdAt?: Date;
  changedAt?: Date;
  id?: string;
  description?: string;
  variableId?: string | null;
  variableReadOnlyId?: string | null;
  weighting?: number;
  [key: string]: string | number | ProfileValues[] | null | undefined | boolean | Date;
}

export class MetadataValuesEntry {
  id!: string;
  label!: TextWithLanguage[];
  value!: TextsWithLanguageAndId[] | TextWithLanguage[] | string;
  valueAsText!: TextWithLanguage | TextWithLanguage[];
}
