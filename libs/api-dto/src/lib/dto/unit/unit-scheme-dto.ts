import { ApiProperty } from '@nestjs/swagger';
import { VeronaVariable } from '@studio-lite/shared-code';

export class UnitSchemeDto {
  @ApiProperty()
    scheme = '';

  @ApiProperty()
    schemeType = '';

  @ApiProperty()
    variables?: VeronaVariable[] = [];
}
