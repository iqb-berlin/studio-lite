import { ApiProperty } from '@nestjs/swagger';

export class CreateKeycloakUserDto {
  @ApiProperty()
    identity!: string;

  @ApiProperty()
    username!: string;

  @ApiProperty()
    email?: string;

  @ApiProperty()
    lastName?: string;

  @ApiProperty()
    firstName?: string;
}
