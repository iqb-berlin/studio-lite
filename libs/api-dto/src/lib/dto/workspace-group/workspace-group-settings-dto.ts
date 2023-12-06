import { ApiProperty } from '@nestjs/swagger';
import { State } from '../../../../../../apps/frontend/src/app/modules/admin/models/state.type';

type Profile = {
  id: string,
  label: string
};

export class WorkspaceGroupSettingsDto {
  @ApiProperty()
    defaultEditor = '';

  @ApiProperty()
    defaultPlayer = '';

  @ApiProperty()
    defaultSchemer = '';

  @ApiProperty()
    profiles?:Profile[] = [];

  @ApiProperty()
    states?:State[] = [];
}
