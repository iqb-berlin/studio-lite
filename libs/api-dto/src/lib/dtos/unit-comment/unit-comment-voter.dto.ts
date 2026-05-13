import { ApiProperty } from '@nestjs/swagger';

export class UnitCommentVoterDto {
  @ApiProperty()
    userName!: string;

  @ApiProperty({ enum: ['up', 'down'] })
    vote!: 'up' | 'down';
}
