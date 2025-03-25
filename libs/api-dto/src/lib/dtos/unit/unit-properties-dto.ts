import { ApiProperty } from '@nestjs/swagger';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitMetadataValues } from './profile-metadata-values.class';

export class UnitPropertiesDto {
  @ApiProperty()
    id!: number;

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

  @ApiProperty()
    metadata?: UnitMetadataValues;

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
    variables?: VariableInfo[];

  @ApiProperty({
    type: 'string',
    format: 'date-time'
  })
    lastChangedMetadata?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time'
  })
    lastChangedDefinition?: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time'
  })
    lastChangedScheme?: Date;

  @ApiProperty()
    lastChangedMetadataUser?: string;

  @ApiProperty()
    lastChangedDefinitionUser?: string;

  @ApiProperty()
    lastChangedSchemeUser?: string;
}
