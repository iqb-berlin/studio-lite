import { ApiProperty } from '@nestjs/swagger';

export class UnitInListDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  state?: string;

  @ApiProperty()
  groupName?: string;

  @ApiProperty()
  sourceWorkspaceId?: number;

  /** The name of the workspace the unit was submitted from (#2232). */
  @ApiProperty()
  sourceWorkspaceName?: string;

  @ApiProperty()
  targetWorkspaceId?: number;

  @ApiProperty()
  returned?: boolean;

  @ApiProperty()
  lastCommentChangedAt?: Date;

  @ApiProperty()
  lastSeenCommentChangedAt?: Date;
}
