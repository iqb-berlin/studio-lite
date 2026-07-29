import { ApiProperty } from '@nestjs/swagger';
import { SessionActivityStatus } from './user-activity-status';

export class UserSessionInfoDto {
  @ApiProperty()
    sessionId!: string;

  @ApiProperty()
    lastActivity?: Date;

  @ApiProperty({ enum: ['active', 'passive', 'orphaned'] })
    activityStatus!: SessionActivityStatus;
}
