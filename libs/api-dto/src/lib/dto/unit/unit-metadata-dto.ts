import { ApiProperty } from '@nestjs/swagger';

export class UnitMetadataDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    key?: string;

  @ApiProperty()
    name?: string;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    transcript?: string;

  @ApiProperty()
    reference?: string;

  @ApiProperty()
    groupName?: string;

  @ApiProperty()
    player?: string;

  @ApiProperty()
    editor?: string;

  @ApiProperty()
    schemer?: string;

  @ApiProperty()
    schemeType?: string;

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
