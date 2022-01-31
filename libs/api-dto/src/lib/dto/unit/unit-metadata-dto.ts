import { ApiProperty } from '@nestjs/swagger';

export class UnitMetadataDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  groupName?: string;

  @ApiProperty()
  player?: string;

  @ApiProperty()
  editor?: string;

  @ApiProperty()
  schemer?: string;
}
