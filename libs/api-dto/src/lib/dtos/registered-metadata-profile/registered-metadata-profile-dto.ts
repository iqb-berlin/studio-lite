import { ApiProperty } from '@nestjs/swagger';
import { TextWithLanguage } from '@iqb/metadata/md-main';

export class RegisteredMetadataProfileDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    url!: string;

  @ApiProperty()
    title!: TextWithLanguage[];

  @ApiProperty()
    creator!: string;

  @ApiProperty()
    maintainer!: string;

  @ApiProperty()
    profiles!: string[];

  @ApiProperty()
    modifiedAt!: Date;
}
