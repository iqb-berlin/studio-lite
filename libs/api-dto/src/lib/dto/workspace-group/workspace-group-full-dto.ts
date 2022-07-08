import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceGroupSettingsDto } from './workspace-group-settings-dto';

export class WorkspaceGroupFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: 'VERA2002' })
  name?: string;

  @ApiProperty()
  settings?: WorkspaceGroupSettingsDto;
}
