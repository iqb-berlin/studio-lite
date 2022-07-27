import { ApiProperty } from '@nestjs/swagger';

export class ReviewInListDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  link?: string;
}
