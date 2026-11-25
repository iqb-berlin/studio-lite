import { ApiProperty } from '@nestjs/swagger';
import type { VariableIdConflictVariable } from '@studio-lite/shared-code';

/** One of the variables behind an id that the export would write twice. */
export class VariableIdConflictVariableDto implements VariableIdConflictVariable {
  /** base: from the unit definition, written under its internal id; derived: from the coding scheme */
  @ApiProperty({ enum: ['base', 'derived'] })
  kind!: 'base' | 'derived';

  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  alias?: string;
}
