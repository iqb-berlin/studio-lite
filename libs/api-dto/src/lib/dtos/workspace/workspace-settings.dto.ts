import { ApiProperty } from '@nestjs/swagger';
import { State } from '../../../../../../apps/frontend/src/app/modules/admin/models/state.type';
import { UnitRichNoteTagDto } from '../unit-rich-note/unit-rich-note-tag.dto';

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

  @ApiProperty()
    hiddenRoutes?: string[];

  @ApiProperty()
    richNoteTags?: UnitRichNoteTagDto[];
}
