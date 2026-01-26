import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitCommentVisibilityDto {
  @ApiProperty()
    hidden!: boolean;

  @ApiProperty()
    userId!: number;
}
