import { ApiProperty } from '@nestjs/swagger';

export class UnitInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    key!: string;

  @ApiProperty()
    name?: string;

  @ApiProperty()
    state?: string;

  @ApiProperty()
    groupName?: string;

  @ApiProperty()
    lastCommentChangedAt?: Date;

  @ApiProperty()
    lastSeenCommentChangedAt?: Date;
}
