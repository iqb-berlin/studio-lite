import { ApiProperty } from '@nestjs/swagger';

export class UnitDefinitionFullDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    unitId!: number;

  @ApiProperty()
    data!: string;
}
