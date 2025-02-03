import { ApiProperty } from '@nestjs/swagger';

export class DeleteUnitsDto {
  @ApiProperty({ example: [1, 2] })
    ids!: number[];
}
