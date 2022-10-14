import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'EL2443' })
    key!: string;

  @ApiPropertyOptional()
    name?: string;

  @ApiPropertyOptional()
    groupName?: string;

  @ApiProperty()
    createFrom?: number;

  @ApiProperty()
    player?: string;

  @ApiProperty()
    editor?: string;

  @ApiProperty()
    schemer?: string;
}
