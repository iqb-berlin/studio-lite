import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariableInfo } from '@iqb/responses';
import { UnitMetadataValues } from './profile-metadata-values.class';

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

  @ApiProperty()
    schemeType?: string;

  @ApiProperty()
    scheme?: string;

  @ApiProperty()
    metadata?: UnitMetadataValues;

  @ApiProperty()
    variables?: VariableInfo[];
}
