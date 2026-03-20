export interface UnitRichNoteTagDto {
  id: string;
  label: { lang: string; value: string }[];
  children?: UnitRichNoteTagDto[];
}
