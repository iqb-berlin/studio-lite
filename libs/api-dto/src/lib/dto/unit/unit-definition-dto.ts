import { ApiProperty } from '@nestjs/swagger';

export class UnitDefinitionDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  variables?: string;

  @ApiProperty()
  definition?: string;
}
