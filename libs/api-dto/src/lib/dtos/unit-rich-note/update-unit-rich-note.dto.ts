import { UnitRichNoteLinkDto } from './unit-rich-note.dto';

export interface UpdateUnitRichNoteDto {
  tagId?: string;
  content?: string;
  links?: UnitRichNoteLinkDto[];
  itemReferences?: string[];
}
