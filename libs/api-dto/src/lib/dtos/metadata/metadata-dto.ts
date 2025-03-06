import { ApiProperty } from '@nestjs/swagger';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

export class MetadataDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    entries?: MetadataValuesEntry[];

  @ApiProperty()
    profileId?: string;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
