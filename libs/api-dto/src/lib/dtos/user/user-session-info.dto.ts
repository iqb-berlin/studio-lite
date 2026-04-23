import { ApiProperty } from '@nestjs/swagger';
import { UserActivityStatus } from './user-activity-status';

export class UserSessionInfoDto {
  @ApiProperty()
    sessionId!: string;

  @ApiProperty()
    lastActivity?: Date;

  @ApiProperty({ enum: ['active', 'passive', 'inactive', 'orphaned'] })
    activityStatus!: UserActivityStatus;
}
