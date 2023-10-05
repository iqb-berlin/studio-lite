import { ApiProperty } from '@nestjs/swagger';

export class CreateKeycloakUserDto {
  @ApiProperty()
    identity!: string;

  @ApiProperty()
    issuer!: string;

  @ApiProperty()
    username!: string;

  @ApiProperty()
    email!: string;

  @ApiProperty()
    lastName!: string;

  @ApiProperty()
    firstName!: string;
}
