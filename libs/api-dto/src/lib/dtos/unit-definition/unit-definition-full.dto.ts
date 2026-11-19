import { ApiProperty } from '@nestjs/swagger';
import { UnitDependencyDto } from '../unit/unit-dependency.dto';

export class UnitDefinitionFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  unitId!: number;

  @ApiProperty()
  data!: string;

  /** The format `data` is written in; `null` when no editor reported it. */
  @ApiProperty({ required: false, nullable: true })
  type?: string | null;

  /** What the unit needs to be played and to be edited (#1602); empty when nothing was reported. */
  @ApiProperty({ required: false, type: [UnitDependencyDto] })
  dependenciesToPlay?: UnitDependencyDto[];

  @ApiProperty({ required: false, type: [UnitDependencyDto] })
  dependenciesToEdit?: UnitDependencyDto[];
}
