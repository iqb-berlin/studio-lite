import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

export class UnitDefinitionDto {
  @ApiProperty()
  variables?: VariableInfo[] = [];

  @ApiProperty()
  definition?: string;

  /**
   * The format the definition is written in, as the editor reports it in `unitDefinitionType`
   * (e.g. `aspect-unit-definition@4.12.0`). It belongs to the definition sent with it: a
   * definition written without a type leaves the unit without one, while a type sent without a
   * definition is ignored.
   */
  @ApiProperty({ required: false })
  definitionType?: string;
}
