import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_UNIT_SIZE_LEVELS, UnitSizeLevels } from '@studio-lite/shared-code';

/** Where the levels of a unit's size begin, in KB (#2229); see `UnitSizeLevels` in the shared code. */
export class UnitSizeLevelsDto implements UnitSizeLevels {
  @ApiProperty({ description: 'From this size on a unit counts as medium, below it as small.' })
  mediumFromKb = DEFAULT_UNIT_SIZE_LEVELS.mediumFromKb;

  @ApiProperty({ description: 'From this size on a unit counts as large.' })
  largeFromKb = DEFAULT_UNIT_SIZE_LEVELS.largeFromKb;

  @ApiProperty({ description: 'From this size on a unit counts as very large.' })
  veryLargeFromKb = DEFAULT_UNIT_SIZE_LEVELS.veryLargeFromKb;
}
