// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';

export class MetadataProfileDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: TextWithLanguage[];

  @ApiProperty()
    groups!: MetadataProfileGroup[];

  @ApiProperty()
    modifiedAt!: Date;
}

export class MetadataProfileGroup {
  label!: TextWithLanguage[];
  entries!: MetadataProfileGroupEntry[];
}

export class MetadataProfileGroupEntry {
  id!: string;
  label!: TextWithLanguage[];
  type!: string;
  parameters!: Record<string, unknown>[];
}
