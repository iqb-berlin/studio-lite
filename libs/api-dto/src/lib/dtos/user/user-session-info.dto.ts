import { ApiProperty } from '@nestjs/swagger';
import { SessionActivityStatus } from './user-activity-status';

export class UserSessionInfoDto {
  @ApiProperty()
    sessionId!: string;

  // Last user interaction.
  @ApiProperty()
    lastActivity?: Date;

  @ApiProperty({ enum: ['active', 'passive', 'orphaned'] })
    activityStatus!: SessionActivityStatus;
}
