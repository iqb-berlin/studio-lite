import { ApiProperty } from '@nestjs/swagger';

/**
 * What a unit's definition says without the definition itself: whether there is one, and the
 * format it is written in. The unit check asks for no more (#2135); the definition embeds its
 * media and runs to megabytes. The variables come with the coding scheme.
 */
export class UnitDefinitionSummaryDto {
  @ApiProperty()
  hasDefinition = false;

  /** As in {@link UnitDefinitionDto}: left out when none is stored. */
  @ApiProperty({ required: false })
  definitionType?: string;
}
