import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

export class UnitDefinitionDto {
  @ApiProperty()
    variables?: VariableInfo[] = [];

  @ApiProperty()
    definition?: string;
}
