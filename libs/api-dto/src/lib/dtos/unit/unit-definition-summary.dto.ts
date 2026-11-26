import { ApiProperty } from '@nestjs/swagger';
import { UnitDependencyDto } from './unit-dependency.dto';

/**
 * What a unit's definition says without the definition itself: whether there is one, the format
 * it is written in, its size and what it needs to be played and edited. The unit check asks for no
 * more (#2135); the definition embeds its media and runs to megabytes. The variables come with the
 * coding scheme.
 */
export class UnitDefinitionSummaryDto {
  @ApiProperty()
  hasDefinition = false;

  /** The stored definition's size in bytes (UTF-8), not in characters; 0 without one (#2197). */
  @ApiProperty()
  size = 0;

  /** As in {@link UnitDefinitionDto}: left out when none is stored. */
  @ApiProperty({ required: false })
  definitionType?: string;

  /**
   * As in {@link UnitDefinitionDto}, empty when the editor reported none or the unit was not saved
   * since they were stored (#1602, #2198).
   */
  @ApiProperty({ type: [UnitDependencyDto] })
  dependenciesToPlay: UnitDependencyDto[] = [];

  @ApiProperty({ type: [UnitDependencyDto] })
  dependenciesToEdit: UnitDependencyDto[] = [];
}
