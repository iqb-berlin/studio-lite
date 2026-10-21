import { UnitExportContentsDto } from '@studio-lite-lib/api-dto';

export type ExportFormat = 'xml' | 'json';

/** The settings flag of an optional export file -- the player is not one of them. */
export type ExportFileFlag = 'addMetadata' | 'addItems' | 'addCodingScheme' | 'addComments' | 'addRichNotes';

type ExportContent = Exclude<keyof UnitExportContentsDto, 'unitId'>;

export type ExportFileSelection = Partial<Record<ExportFileFlag, boolean>>;

/**
 * An optional file of the export: the flag that adds it, the formats that have it, and which content
 * of a unit fills it. `checkedWhenUnknown` is the choice when the contents cannot be read: the
 * files that were always written stay in, the ones that were opt-in stay out.
 */
export interface ExportFileOption {
  flag: ExportFileFlag;
  label: string;
  hint: string;
  formats: ExportFormat[];
  contents: ExportContent[];
  checkedWhenUnknown: boolean;
}

export interface ExportFileState {
  option: ExportFileOption;
  available: boolean;
  checked: boolean;
}

/**
 * The optional files, in the order the dialog shows them. The two formats differ in one place: XML
 * keeps the items inside the metadata file, so there one option covers both, while JSON writes them
 * to files of their own. A file that becomes optional later gets an entry here and with it the
 * preselection and the hint.
 */
export const EXPORT_FILE_OPTIONS: ExportFileOption[] = [
  {
    flag: 'addMetadata',
    label: 'unit-download.add-metadata-and-items',
    hint: 'unit-download.no-metadata-and-items',
    formats: ['xml'],
    contents: ['metadata', 'items'],
    checkedWhenUnknown: true
  },
  {
    flag: 'addMetadata',
    label: 'unit-download.add-metadata',
    hint: 'unit-download.no-metadata',
    formats: ['json'],
    contents: ['metadata'],
    checkedWhenUnknown: true
  },
  {
    flag: 'addItems',
    label: 'unit-download.add-items',
    hint: 'unit-download.no-items',
    formats: ['json'],
    contents: ['items'],
    checkedWhenUnknown: true
  },
  {
    flag: 'addCodingScheme',
    label: 'unit-download.add-coding-scheme',
    hint: 'unit-download.no-coding-scheme',
    formats: ['xml', 'json'],
    contents: ['codingScheme'],
    checkedWhenUnknown: true
  },
  {
    flag: 'addComments',
    label: 'unit-download.add-comments',
    hint: 'unit-download.no-comments',
    formats: ['xml', 'json'],
    contents: ['comments'],
    checkedWhenUnknown: false
  },
  {
    flag: 'addRichNotes',
    label: 'unit-download.add-rich-notes',
    hint: 'unit-download.no-rich-notes',
    formats: ['xml', 'json'],
    contents: ['richNotes'],
    checkedWhenUnknown: false
  }
];

/**
 * The optional files of a format and whether each is checked. A file is available when one of the
 * chosen units has content for it. Becoming available checks it; being unavailable unchecks it; in
 * between it keeps what it was, so a box unchecked by hand stays unchecked while the selection
 * changes. Without an answer on the contents (`null`), every file counts as available and starts
 * as it did before the files became optional ({@link ExportFileOption.checkedWhenUnknown}) -- the
 * export then decides by content, and a failed request neither drops nor adds a file.
 */
export function getExportFileStates(
  format: ExportFormat,
  selectedUnitIds: number[],
  contents: UnitExportContentsDto[] | null,
  previous: ExportFileState[]
): ExportFileState[] {
  const selectedContents = (contents ?? []).filter(unit => selectedUnitIds.includes(unit.unitId));
  return EXPORT_FILE_OPTIONS
    .filter(option => option.formats.includes(format))
    .map(option => {
      const available = contents === null ||
        selectedContents.some(unit => option.contents.some(content => unit[content]));
      const before = previous.find(state => state.option.flag === option.flag);
      let checked = contents === null ? option.checkedWhenUnknown : available;
      if (available && before?.available) checked = before.checked;
      return { option, available, checked };
    });
}

/** The flags the states stand for, to be merged into the download settings. */
export function getExportFileSelection(states: ExportFileState[]): ExportFileSelection {
  return states.reduce<ExportFileSelection>(
    (selection, state) => ({ ...selection, [state.option.flag]: state.checked }),
    {}
  );
}
