import { ApiProperty } from '@nestjs/swagger';

/**
 * What a unit's definition says without the definition itself: whether there is one, the format
 * it is written in and its size. The unit check asks for no more (#2135); the definition embeds
 * its media and runs to megabytes. The variables come with the coding scheme.
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
}
