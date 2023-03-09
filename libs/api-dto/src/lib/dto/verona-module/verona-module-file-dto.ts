import { ApiProperty } from '@nestjs/swagger';

export class VeronaModuleFileDto {
  @ApiProperty()
    key!: string;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    file!: string;

  @ApiProperty()
    fileName?: string;
}
