import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceSettingsDto {
  @ApiProperty()
  defaultEditor = '';

  @ApiProperty()
  defaultPlayer = '';

  @ApiProperty()
  unitGroups: string[] = [];
}
