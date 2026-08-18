import { ApiProperty } from '@nestjs/swagger';
import { SessionActivityStatus } from './user-activity-status';

export class UserSessionInfoDto {
  @ApiProperty()
    sessionId!: string;

  // Last user interaction.
  @ApiProperty()
    lastActivity?: Date;

  // Last sign of a still-open tab; older than ORPHANED_SESSION_THRESHOLD_MS means the
  // browser behind this session is gone.
  @ApiProperty()
    lastSeen?: Date;

  @ApiProperty({ enum: ['active', 'passive', 'orphaned'] })
    activityStatus!: SessionActivityStatus;
}
