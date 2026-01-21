import { ApiProperty } from '@nestjs/swagger';

export class IdArrayDto {
  @ApiProperty({ example: [1, 2] })
    ids!: number[];
}
