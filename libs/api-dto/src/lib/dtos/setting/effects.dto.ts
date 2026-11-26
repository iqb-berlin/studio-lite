import { ApiProperty } from '@nestjs/swagger';

/** What moves for show in the studio, switched on by an administrator; all of it is off until then. */
export class EffectsDto {
  @ApiProperty({ description: 'Whether snow falls on the start page (#2221).' })
  snowfall = false;
}
