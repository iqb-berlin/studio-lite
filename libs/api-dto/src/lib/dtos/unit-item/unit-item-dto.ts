import { ApiProperty } from '@nestjs/swagger';

export class UnitItemDto {
  @ApiProperty()
    uuid!: string;

  @ApiProperty()
    id?: string;

  @ApiProperty()
    order?: number;

  @ApiProperty()
    position?: string;

  @ApiProperty()
    locked?: boolean;

  @ApiProperty()
    variableId?: string;

  @ApiProperty()
    variableReadOnlyId?: string;

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
