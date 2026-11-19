import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitDependencyDto } from './unit-dependency.dto';

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

  /**
   * What the unit needs to be played and to be edited, as the editor reports it with the
   * definition (#1602). Left out, the stored lists stay as they are; an empty list says there is
   * nothing.
   */
  @ApiProperty({ required: false, type: [UnitDependencyDto] })
  dependenciesToPlay?: UnitDependencyDto[];

  @ApiProperty({ required: false, type: [UnitDependencyDto] })
  dependenciesToEdit?: UnitDependencyDto[];
}
