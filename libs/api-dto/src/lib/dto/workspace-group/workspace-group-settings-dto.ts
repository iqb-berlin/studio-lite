import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceGroupSettingsDto {
  @ApiProperty()
    defaultEditor = '';

  @ApiProperty()
    defaultPlayer = '';

  @ApiProperty()
    defaultSchemer = '';
}
