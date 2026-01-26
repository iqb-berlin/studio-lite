import { ApiProperty } from '@nestjs/swagger';

export class AppLogoDto {
  @ApiProperty()
    data!: string;

  @ApiProperty()
    bodyBackground?: string;

  @ApiProperty()
    boxBackground?: string;
}
