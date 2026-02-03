import { ApiProperty } from '@nestjs/swagger';

export class UnitCommentDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    body!: string;

  @ApiProperty()
    userName!: string;

  @ApiProperty()
    userId!: number;

  @ApiProperty()
    itemUuids?: string[];

  @ApiProperty()
    parentId?: number | null;

  @ApiProperty()
    unitId?: number;

  @ApiProperty()
    hidden!: boolean;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
