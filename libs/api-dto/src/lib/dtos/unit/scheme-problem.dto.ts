import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SchemeProblem, SchemeProblemType } from '@studio-lite/shared-code';

/**
 * A problem the schemer finds in a unit's coding scheme that makes its coding fail; the export dialog
 * names the chosen units with one before the export (#2135).
 */
export class SchemeProblemDto implements Omit<SchemeProblem, 'breaking' | 'baseVariable'> {
  @ApiProperty({ description: 'A problem type of @iqb/responses, or NAME_TWICE or UNREADABLE' })
  type!: SchemeProblemType;

  @ApiPropertyOptional({ description: 'The variable as the schemer names it; none for an unreadable scheme' })
  variable?: string;
}
