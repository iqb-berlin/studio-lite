import { ApiProperty } from '@nestjs/swagger';

/** One of the variables behind an id that the export would write twice. */
export class VariableIdConflictVariableDto {
  /** base: from the unit definition, written under its internal id; derived: from the coding scheme */
  @ApiProperty({ enum: ['base', 'derived'] })
  kind!: 'base' | 'derived';

  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  alias?: string;
}
