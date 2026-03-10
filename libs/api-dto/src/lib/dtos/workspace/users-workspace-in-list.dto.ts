import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceSettingsDto } from './workspace-settings.dto';

export class UsersWorkspaceInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty({ example: 463 })
    groupId!: number;

  @ApiProperty()
    dropBoxId!: number;

  @ApiProperty()
    userAccessLevel!: number;

  @ApiProperty()
    unitsCount!: number;

  @ApiProperty()
    settings?: WorkspaceSettingsDto;
}
