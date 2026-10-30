import { ApiProperty } from '@nestjs/swagger';
import { State } from './state.type';

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
  profiles?: Profile[] = [];

  @ApiProperty()
  states?: State[] = [];

  // Units keep the id of a deleted state, so a new state gets one above this (#2009).
  @ApiProperty({ description: 'The highest id the group ever gave a state' })
  lastStateId?: number;

  @ApiProperty()
  hiddenRoutes?: string[];

  @ApiProperty()
  richNoteTags?: string[] | UnitRichNoteTagDto[] = [];
}
