import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UnitContentDto } from './unit-content.dto';
import { UnitLastChangedDto } from './unit-last-changed.dto';

export class UnitPropertiesDto extends IntersectionType(UnitContentDto, UnitLastChangedDto) {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  uuid?: string;

  @ApiProperty()
  key?: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  state?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  transcript?: string;

  @ApiProperty()
  reference?: string;

  @ApiProperty()
  groupName?: string;
}
