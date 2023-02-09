import { ApiProperty } from '@nestjs/swagger';

export class AppLogoDto {
  @ApiProperty()
    data!: string;

  @ApiProperty()
    alt = '';

  @ApiProperty()
    bodyBackground?: string;

  @ApiProperty()
    boxBackground?: string;
}
