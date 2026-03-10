// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceSettingsDto } from './workspace-settings.dto';

export class WorkspaceInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty({ example: 463 })
    groupId!: number;

  @ApiProperty()
    dropBoxId!: number;

  @ApiProperty()
    unitsCount!: number;

  @ApiProperty()
    settings?: WorkspaceSettingsDto;
}
