import { ApiProperty } from '@nestjs/swagger';

export class BaseUnitItemDto {
  @ApiProperty({ example: 'item01' })
    alias?: string;

  @ApiProperty()
    variableId?: string;

  @ApiProperty()
    weighting?: number;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    unitId!: number;

  @ApiProperty()
    metadataId?: number;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
