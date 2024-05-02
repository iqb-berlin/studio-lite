import { ApiProperty } from '@nestjs/swagger';

export class MetadataProfileRegistryDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    csv!: string;

  @ApiProperty()
    modifiedAt!: Date;
}
