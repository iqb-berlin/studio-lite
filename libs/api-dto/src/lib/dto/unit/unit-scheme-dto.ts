import { ApiProperty } from '@nestjs/swagger';

export class UnitSchemeDto {
  @ApiProperty()
    scheme = '';

  @ApiProperty()
    schemeType = '';

  @ApiProperty()
    variables?: unknown[] = [];
}
