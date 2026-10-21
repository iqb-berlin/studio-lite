import { ApiProperty } from '@nestjs/swagger';

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
}
