import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({example: 'hugo'})
  name!: string;

  @ApiProperty({example: 'duhastaberaucheintalent'})
  password!: string;

  @ApiPropertyOptional({type: Boolean, example: false})
  isAdmin = false;

  @ApiPropertyOptional({type: String, example: 'hugo@iqb.hu-berlin.de; Student'})
  description = '';
}
