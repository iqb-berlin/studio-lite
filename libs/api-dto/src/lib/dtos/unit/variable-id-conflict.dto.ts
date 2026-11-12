import { ApiProperty } from '@nestjs/swagger';
import { VariableIdConflictVariableDto } from './variable-id-conflict-variable.dto';

/**
 * An id that the export would write for more than one variable. The Testcenter (from version 19)
 * rejects such a unit XML, and readers of the JSON that look variables up by id mix them up (#2119).
 */
export class VariableIdConflictDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: [VariableIdConflictVariableDto] })
  variables!: VariableIdConflictVariableDto[];
}
