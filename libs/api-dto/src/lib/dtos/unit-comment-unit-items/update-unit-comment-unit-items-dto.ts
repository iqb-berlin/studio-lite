import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitCommentUnitItemsDto {
  @ApiProperty()
    unitItemUuids!: string[];

  @ApiProperty()
    userId!: number;
}
