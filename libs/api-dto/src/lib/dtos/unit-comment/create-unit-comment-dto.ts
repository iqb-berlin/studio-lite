import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitCommentDto {
  @ApiProperty()
    body!: string;

  @ApiProperty()
    userName!: string;

  @ApiProperty()
    userId!: number;

  @ApiProperty()
    parentId?: number | null;

  @ApiProperty()
    unitId?: number;

  @ApiProperty()
    itemId?: number;
}
