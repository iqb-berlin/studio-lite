import { ApiProperty } from '@nestjs/swagger';

/** When the three parts of a unit were last changed, and by whom. */
export class UnitLastChangedDto {
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
