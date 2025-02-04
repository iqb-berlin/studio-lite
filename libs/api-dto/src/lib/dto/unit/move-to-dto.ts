import { ApiProperty } from '@nestjs/swagger';

export class MoveToDto {
  @ApiProperty({ example: [1, 2] })
    ids!: number[];

  @ApiProperty({ example: 1 })
    targetId!: number;
}
