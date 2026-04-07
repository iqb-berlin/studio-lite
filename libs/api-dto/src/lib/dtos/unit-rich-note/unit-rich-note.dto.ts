import { UnitRichNoteTagDto } from './unit-rich-note-tag.dto';

export interface UnitRichNoteLinkDto {
  url: string;
  label: { lang: string; value: string }[];
  description?: { lang: string; value: string }[];
  type?: string;
}

export interface UnitRichNotesDto {
  tags: UnitRichNoteTagDto[];
  notes: UnitRichNoteDto[];
}

export interface UnitRichNoteDto {
  id: number;
  unitId: number;
  tagId: string;
  content: string;
  links?: UnitRichNoteLinkDto[];
  itemReferences?: string[];
  createdAt: Date;
  changedAt: Date;
}
