import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

export class UnitSchemeDto {
  @ApiProperty()
    scheme = '';

  @ApiProperty()
    schemeType = '';

  @ApiProperty()
    variables?: VariableInfo[] = [];
}
