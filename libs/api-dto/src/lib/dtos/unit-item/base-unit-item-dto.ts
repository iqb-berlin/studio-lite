import { ApiProperty } from '@nestjs/swagger';

export class BaseUnitItemDto {
  @ApiProperty({ example: 'item01' })
    key?: string;

  @ApiProperty()
    order?: number;

  @ApiProperty()
    position?: string;

  @ApiProperty()
    locked?: boolean;

  @ApiProperty()
    variableId?: string;

  @ApiProperty()
    weighting?: number;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    unitId!: number;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
