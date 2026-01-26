import { ApiProperty } from '@nestjs/swagger';

export class MyDataDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    email?: string;

  @ApiProperty()
    lastName?: string;

  @ApiProperty()
    firstName?: string;

  @ApiProperty()
    emailPublishApproved?: boolean;
}
