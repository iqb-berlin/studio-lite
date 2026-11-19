import { ApiProperty } from '@nestjs/swagger';

/**
 * One row of the report over the workspaces of a group, or of all groups: what the interface puts
 * into its Excel file, with headers and dates in the language of the interface (#2181).
 */
export class WorkspaceReportDto {
  @ApiProperty()
  groupId!: number;

  @ApiProperty()
  groupName!: string;

  @ApiProperty()
  workspaceId!: number;

  @ApiProperty()
  workspaceName!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The newest change of any unit of the workspace (ISO 8601); null without units or changes.'
  })
  lastChange!: string | null;

  @ApiProperty()
  unitCount!: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Units per editor; the key \'\' counts the units without one.'
  })
  editors!: Record<string, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Units per player; the key \'\' counts the units without one.'
  })
  players!: Record<string, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Units per schemer; the key \'\' counts the units without one.'
  })
  schemers!: Record<string, number>;
}
