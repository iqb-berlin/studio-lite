import { ApiProperty } from '@nestjs/swagger';
import { UnitMetadataValues } from './profile-metadata-values.class';

export class UnitMetadataDto {
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
    variables?: any;

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
}
