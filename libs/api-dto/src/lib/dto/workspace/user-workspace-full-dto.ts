import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceSettingsDto } from './workspace-settings-dto';

export class UserWorkspaceFullDto {
  @ApiProperty()
    id!: number;

  @ApiProperty({ example: 'VERA2002' })
    name?: string;

  @ApiProperty({ example: 463 })
    groupId?: number;

  @ApiProperty({ example: 'Hörverstehen' })
    groupName?: string;

  @ApiProperty()
    userAccessLevel!: number;

  @ApiProperty()
    dropBoxId!: number;

  @ApiProperty()
    settings?: WorkspaceSettingsDto;
}
