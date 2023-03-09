import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceSettingsDto } from './workspace-settings-dto';

export class WorkspaceFullDto {
  @ApiProperty()
    id!: number;

  @ApiProperty({ example: 'VERA2002' })
    name?: string;

  @ApiProperty({ example: 463 })
    groupId?: number;

  @ApiProperty({ example: 'Hörverstehen' })
    groupName?: string;

  @ApiProperty()
    settings?: WorkspaceSettingsDto;
}
