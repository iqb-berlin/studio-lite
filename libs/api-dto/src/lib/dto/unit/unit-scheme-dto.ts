import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqb/responses';

export class UnitSchemeDto {
  @ApiProperty()
    scheme = '';

  @ApiProperty()
    schemeType = '';

  @ApiProperty()
    variables?: VariableInfo[] = [];
}
