import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitContentDto } from './unit-content.dto';

export class CreateUnitDto extends UnitContentDto {
  @ApiProperty({ example: 'EL2443' })
  key!: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  groupName?: string;

  @ApiProperty()
  createFrom?: number;

  @ApiProperty()
  createFromKey?: string;
}
