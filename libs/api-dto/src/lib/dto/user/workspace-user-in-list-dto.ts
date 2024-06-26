import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceUserInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    isAdmin!: boolean;

  @ApiProperty()
    description?: string;

  @ApiProperty()
    displayName?: string;

  @ApiProperty()
    hasWorkspaceWriteAccess!: boolean;

  @ApiProperty()
    email?: string;
}
