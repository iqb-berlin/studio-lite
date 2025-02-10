import { ApiProperty } from '@nestjs/swagger';

export class NameDto {
  @ApiProperty({ example: 'name' })
    name!: string;
}
