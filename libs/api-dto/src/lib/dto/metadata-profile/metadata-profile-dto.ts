import { ApiProperty } from '@nestjs/swagger';
import { TextWithLanguage } from '@iqb/metadata/md-main';

export class MetadataProfileDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: TextWithLanguage[];

  @ApiProperty()
    groups!: Record<string, never>[];

  @ApiProperty()
    modifiedAt!: Date;
}
