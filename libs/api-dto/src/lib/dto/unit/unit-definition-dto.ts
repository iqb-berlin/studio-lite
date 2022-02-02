import { ApiProperty } from '@nestjs/swagger';

export class UnitDefinitionDto {
  @ApiProperty()
  variables = {};

  @ApiProperty()
  definition?: string;
}
