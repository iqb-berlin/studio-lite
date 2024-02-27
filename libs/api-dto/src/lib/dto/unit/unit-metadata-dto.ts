import { ApiProperty } from '@nestjs/swagger';

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
    metadata?: string;

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
    variables?: string;

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
