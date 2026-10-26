import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitMetadataValues } from './profile-metadata-values.class';

/**
 * What a unit is made with beside its name: the modules that edit, play and code it, its coding
 * scheme, its metadata and the variables its definition declares.
 */
export class UnitContentDto {
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
