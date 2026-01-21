import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitCommentDto {
  @ApiProperty()
    body!: string;

  @ApiProperty()
    userId!: number;
}
