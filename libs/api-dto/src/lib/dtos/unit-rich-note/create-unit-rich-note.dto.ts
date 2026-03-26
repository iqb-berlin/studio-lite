import { UnitRichNoteLinkDto } from './unit-rich-note.dto';

export interface CreateUnitRichNoteDto {
  unitId: number;
  tagId: string;
  content: string;
  links?: UnitRichNoteLinkDto[];
  itemReferences?: string[];
}
