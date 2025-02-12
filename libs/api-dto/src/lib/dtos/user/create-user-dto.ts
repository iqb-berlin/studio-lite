import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'hugo' })
    name!: string;

  @ApiProperty({ example: 'duhastaberaucheintalent' })
    password!: string;

  @ApiPropertyOptional({ type: Boolean, example: false })
    isAdmin = false;

  @ApiPropertyOptional({ type: String, example: 'Student im HuDel-Projekt' })
    description = '';

  @ApiProperty()
    email?: string;

  @ApiProperty()
    lastName?: string;

  @ApiProperty()
    firstName?: string;

  @ApiProperty()
    issuer?: string;

  @ApiProperty()
    identity?: string;
}
