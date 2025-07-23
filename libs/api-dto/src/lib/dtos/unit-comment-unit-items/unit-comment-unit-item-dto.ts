import { ApiProperty } from '@nestjs/swagger';

export class UnitCommentUnitItemDto {
  @ApiProperty()
    unitItemUuid!: string;

  @ApiProperty()
    unitCommentId?: number;

  @ApiProperty()
    unitId!: number;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
