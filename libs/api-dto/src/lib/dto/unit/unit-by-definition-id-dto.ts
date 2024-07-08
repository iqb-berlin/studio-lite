import { ApiProperty } from '@nestjs/swagger';

export class UnitByDefinitionIdDto {
  @ApiProperty()
    definitionId!: number;

  @ApiProperty()
    key!: string;

  @ApiProperty()
    name?: string;

  @ApiProperty()
    groupName?: string;

  @ApiProperty()
    id!: number;

  @ApiProperty()
    workspaceName?: string;

  @ApiProperty()
    workspaceId!: number;

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
