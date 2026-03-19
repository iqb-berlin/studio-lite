export interface UnitRichNoteTagDto {
  id: string;
  label: string;
  children?: UnitRichNoteTagDto[];
}
