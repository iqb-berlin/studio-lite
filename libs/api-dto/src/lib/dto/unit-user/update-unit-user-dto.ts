import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitUserDto {
  @ApiProperty()
  lastSeenCommentChangedAt!: Date;

  @ApiProperty()
  userId!: number;
}
