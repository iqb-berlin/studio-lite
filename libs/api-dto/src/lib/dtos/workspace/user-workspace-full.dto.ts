import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkspaceSettingsDto } from './workspace-settings.dto';

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

  /** The workspace units from here are submitted to; null where there is none the server accepts (#1805). */
  @ApiProperty()
  dropBoxId!: number | null;

  /** Its name, shown beside the button that submits to it (#2232). */
  @ApiPropertyOptional({ example: 'Abgabe Mathematik' })
  dropBoxName?: string;

  @ApiProperty()
  settings?: WorkspaceSettingsDto;
}
