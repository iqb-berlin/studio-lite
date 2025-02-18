import { ApiProperty } from '@nestjs/swagger';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

export class MetadataDto {
  @ApiProperty()
    data?: MetadataValuesEntry[];

  @ApiProperty()
    profile?: string;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
