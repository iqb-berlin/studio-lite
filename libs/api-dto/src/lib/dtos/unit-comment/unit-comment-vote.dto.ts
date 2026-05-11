import { ApiProperty } from '@nestjs/swagger';

export class UnitCommentVoteDto {
  @ApiProperty({ enum: ['up', 'down', null] })
    vote!: 'up' | 'down' | null;
}
