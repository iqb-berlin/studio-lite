import { ApiProperty } from '@nestjs/swagger';
import { UserWorkspaceAccessDto } from '@studio-lite-lib/api-dto';

export class UserWorkspaceAccessForGroupDto {
  @ApiProperty()
    groupId!: number;

  @ApiProperty()
    workspaces!: UserWorkspaceAccessDto[];
}
