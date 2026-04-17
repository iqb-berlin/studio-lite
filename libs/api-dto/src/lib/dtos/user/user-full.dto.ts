import { ApiProperty } from '@nestjs/swagger';

export type UserActivityStatus = 'active' | 'passive' | 'inactive';

export class UserFullDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name?: string;

  @ApiProperty()
    isAdmin?: boolean;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    password?: string;

  @ApiProperty()
    email?: string;

  @ApiProperty()
    lastName?: string;

  @ApiProperty()
    firstName?: string;

  @ApiProperty()
    emailPublishApproved?: boolean;

  @ApiProperty()
    lastActivity?: Date;

  @ApiProperty()
    isLoggedIn?: boolean;

  @ApiProperty({ required: false, enum: ['active', 'passive', 'inactive'] })
    activityStatus?: UserActivityStatus;
}
