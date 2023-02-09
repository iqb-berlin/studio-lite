import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceSettingsDto {
  @ApiProperty()
    defaultEditor = '';

  @ApiProperty()
    defaultPlayer = '';

  @ApiProperty()
    defaultSchemer = '';

  @ApiProperty()
    unitGroups?: string[];

  @ApiProperty()
    stableModulesOnly?: boolean = true;
}
