import { ApiProperty } from '@nestjs/swagger';
import { VeronaVariable } from '@studio-lite/shared-code';

export class UnitDefinitionDto {
  @ApiProperty()
    variables?: VeronaVariable[] = [];

  @ApiProperty()
    definition?: string;
}
