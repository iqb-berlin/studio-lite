import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqb/responses';

export class UnitDefinitionDto {
  @ApiProperty()
    variables?: VariableInfo[] = [];

  @ApiProperty()
    definition?: string;
}
