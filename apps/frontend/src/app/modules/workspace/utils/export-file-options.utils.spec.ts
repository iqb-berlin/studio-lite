import { UnitExportContentsDto } from '@studio-lite-lib/api-dto';
import {
  ExportFileState, getExportFileSelection, getExportFileStates
} from './export-file-options.utils';

const unit = (unitId: number, contents: Partial<UnitExportContentsDto> = {}): UnitExportContentsDto => ({
  unitId,
  metadata: false,
  items: false,
  codingScheme: false,
  comments: false,
  richNotes: false,
  ...contents
});

const flagsOf = (states: ExportFileState[]) => states.map(state => state.option.flag);
const stateOf = (states: ExportFileState[], flag: string) => states.find(state => state.option.flag === flag);

describe('export file options', () => {
  describe('getExportFileStates', () => {
    it('offers one option for metadata and items in XML, and one each in JSON', () => {
      const xml = getExportFileStates('xml', [], [], []);
      const json = getExportFileStates('json', [], [], []);

      expect(flagsOf(xml)).toEqual(['addMetadata', 'addCodingScheme', 'addComments', 'addRichNotes']);
      expect(xml[0].option.label).toBe('unit-download.add-metadata-and-items');
      expect(flagsOf(json))
        .toEqual(['addMetadata', 'addItems', 'addCodingScheme', 'addComments', 'addRichNotes']);
    });

    it('makes a file available and checked when one of the chosen units has content for it', () => {
      const contents = [unit(1, { comments: true }), unit(2)];

      const states = getExportFileStates('json', [1, 2], contents, []);

      expect(stateOf(states, 'addComments')).toMatchObject({ available: true, checked: true });
      expect(stateOf(states, 'addMetadata')).toMatchObject({ available: false, checked: false });
    });

    it('looks at the chosen units only', () => {
      const contents = [unit(1, { codingScheme: true }), unit(2)];

      const states = getExportFileStates('xml', [2], contents, []);

      expect(stateOf(states, 'addCodingScheme')).toMatchObject({ available: false, checked: false });
    });

    it('counts items for the XML metadata option, but not for the JSON one', () => {
      const contents = [unit(1, { items: true })];

      expect(stateOf(getExportFileStates('xml', [1], contents, []), 'addMetadata')?.available).toBe(true);
      expect(stateOf(getExportFileStates('json', [1], contents, []), 'addMetadata')?.available).toBe(false);
      expect(stateOf(getExportFileStates('json', [1], contents, []), 'addItems')?.available).toBe(true);
    });

    it('keeps a box unchecked by hand while its file stays available', () => {
      const contents = [unit(1, { comments: true }), unit(2, { comments: true })];
      const first = getExportFileStates('xml', [1], contents, [])
        .map(state => (state.option.flag === 'addComments' ? { ...state, checked: false } : state));

      const next = getExportFileStates('xml', [1, 2], contents, first);

      expect(stateOf(next, 'addComments')).toMatchObject({ available: true, checked: false });
    });

    it('checks a box again when its file comes back after being unavailable', () => {
      const contents = [unit(1, { comments: true }), unit(2)];
      const unavailable = getExportFileStates('xml', [2], contents, []);

      const next = getExportFileStates('xml', [1], contents, unavailable);

      expect(stateOf(next, 'addComments')).toMatchObject({ available: true, checked: true });
    });

    it('keeps the metadata choice when the format changes', () => {
      const contents = [unit(1, { metadata: true })];
      const xml = getExportFileStates('xml', [1], contents, [])
        .map(state => (state.option.flag === 'addMetadata' ? { ...state, checked: false } : state));

      const json = getExportFileStates('json', [1], contents, xml);

      expect(stateOf(json, 'addMetadata')).toMatchObject({ available: true, checked: false });
    });

    it('offers every file when the contents are unknown, checked as before they became optional', () => {
      const states = getExportFileStates('json', [1], null, []);

      expect(states.every(state => state.available)).toBe(true);
      expect(states.filter(state => state.checked).map(state => state.option.flag))
        .toEqual(['addMetadata', 'addItems', 'addCodingScheme']);
    });
  });

  describe('getExportFileSelection', () => {
    it('maps the states onto the settings flags', () => {
      const states = getExportFileStates('xml', [1], [unit(1, { metadata: true })], []);

      expect(getExportFileSelection(states)).toEqual({
        addMetadata: true,
        addCodingScheme: false,
        addComments: false,
        addRichNotes: false
      });
    });
  });
});
