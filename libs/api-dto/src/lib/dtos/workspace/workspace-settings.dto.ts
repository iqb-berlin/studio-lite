import { ApiProperty } from '@nestjs/swagger';
import { State } from '../../../../../../apps/frontend/src/app/modules/admin/models/state.type';

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

  @ApiProperty()
    unitMDProfile?: string;

  @ApiProperty()
    itemMDProfile?: string;

  @ApiProperty()
    states?: State[];
}
