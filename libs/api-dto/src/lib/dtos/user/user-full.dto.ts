import { ApiProperty } from '@nestjs/swagger';

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
}
