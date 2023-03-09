import { ApiProperty } from '@nestjs/swagger';

export class UnitDefinitionDto {
  @ApiProperty()
    variables?: unknown[] = [];

  @ApiProperty()
    definition?: string;
}
