import { ApiProperty } from '@nestjs/swagger';
import { UnitSizeLevelsDto } from './unit-size-levels.dto';

/**
 * What an administrator sets for the technical validation of units, the card under „Eigenschaften“
 * (#2229). So far the levels of a unit's size; what the validation asks besides comes as a further
 * field, not as a setting of its own.
 */
export class UnitValidationDto {
  @ApiProperty({ type: UnitSizeLevelsDto })
  sizeLevels: UnitSizeLevelsDto = new UnitSizeLevelsDto();
}
