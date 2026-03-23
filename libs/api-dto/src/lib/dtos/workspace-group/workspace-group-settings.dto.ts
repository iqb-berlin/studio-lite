import { ApiProperty } from '@nestjs/swagger';
import { State } from '../../../../../../apps/frontend/src/app/modules/admin/models/state.type';

import { UnitRichNoteTagDto } from '../unit-rich-note/unit-rich-note-tag.dto';

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

  @ApiProperty()
    hiddenRoutes?: string[];

  @ApiProperty()
    richNoteTags?: UnitRichNoteTagDto[] = [];
}
