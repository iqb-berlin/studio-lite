import { createMock } from '@golevelup/ts-jest';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { MetadataValuesEntry, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import {
  entryHasContent, findUnitExportContents, hasItems, hasMetadataContent
} from './unit-export-contents';
import { UnitService } from '../services/unit.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';

const entry = (value: unknown): MetadataValuesEntry => ({ id: 'e1', value } as unknown as MetadataValuesEntry);

const variable = (id: string, alias: string, type: VariableInfo['type']): VariableInfo => ({
  id, alias, type, format: '', multiple: false, nullable: false, values: [], valuePositionLabels: []
});

describe('unit export contents', () => {
  describe('entryHasContent', () => {
    it('takes a non-empty string, list or { raw } value as content', () => {
      expect(entryHasContent(entry('x'))).toBe(true);
      expect(entryHasContent(entry([{ id: 'v1' }]))).toBe(true);
      expect(entryHasContent(entry({ raw: 'x' }))).toBe(true);
    });

    it('takes numbers and booleans of untyped legacy rows as content, false and 0 included', () => {
      expect(entryHasContent(entry(0))).toBe(true);
      expect(entryHasContent(entry(false))).toBe(true);
    });

    it('takes empty values and a missing entry as no content', () => {
      expect(entryHasContent(undefined)).toBe(false);
      expect(entryHasContent(entry(''))).toBe(false);
      expect(entryHasContent(entry([]))).toBe(false);
      expect(entryHasContent(entry({ raw: '' }))).toBe(false);
      expect(entryHasContent(entry(null))).toBe(false);
    });
  });

  describe('hasMetadataContent', () => {
    it('is false for no metadata and for the empty shape the XML export used to write', () => {
      expect(hasMetadataContent(undefined)).toBe(false);
      expect(hasMetadataContent(null)).toBe(false);
      expect(hasMetadataContent({ profiles: [], items: [] })).toBe(false);
    });

    it('is false for profiles whose entries are all empty', () => {
      expect(hasMetadataContent({ profiles: [{ profileId: 'p', entries: [entry(''), entry([])] }] })).toBe(false);
    });

    it('is true for a profile entry with content', () => {
      expect(hasMetadataContent({ profiles: [{ profileId: 'p', entries: [entry(''), entry('x')] }] })).toBe(true);
    });

    it('does not count items as unit metadata', () => {
      expect(hasMetadataContent({ profiles: [], items: [{ id: 'item1' }] })).toBe(false);
    });

    it('is true for keys of a pre-profile legacy shape', () => {
      expect(hasMetadataContent({ legacyKey: 'x' } as unknown as UnitMetadataValues)).toBe(true);
    });
  });

  describe('hasItems', () => {
    it('is true only for an item with an id', () => {
      expect(hasItems({ items: [{ id: 'item1' }] })).toBe(true);
      expect(hasItems({ items: [{ uuid: 'u1' }] })).toBe(false);
      expect(hasItems({ items: [] })).toBe(false);
      expect(hasItems({})).toBe(false);
      expect(hasItems(null)).toBe(false);
    });
  });

  describe('findUnitExportContents', () => {
    it('combines the unit sources with the comment and rich note lookups', async () => {
      const unitService = createMock<UnitService>();
      const unitCommentService = createMock<UnitCommentService>();
      const unitRichNoteService = createMock<UnitRichNoteService>();
      unitService.findAllExportSources.mockResolvedValue([
        {
          id: 3, metadata: { profiles: [{ profileId: 'p', entries: [entry('x')] }] }, scheme: '', variables: []
        }
      ]);
      unitCommentService.findUnitIdsWithComments.mockResolvedValue(new Set([3]));
      unitRichNoteService.findUnitIdsWithNotes.mockResolvedValue(new Set());

      const contents = await findUnitExportContents(5, unitService, unitCommentService, unitRichNoteService);

      expect(contents).toEqual([{
        unitId: 3,
        metadata: true,
        items: false,
        codingScheme: false,
        comments: true,
        richNotes: false,
        variableIdConflicts: [],
        schemeProblems: []
      }]);
      expect(unitService.findAllExportSources).toHaveBeenCalledWith(5);
    });

    it('names the ids the export would write twice (#2119)', async () => {
      const unitService = createMock<UnitService>();
      const unitCommentService = createMock<UnitCommentService>();
      const unitRichNoteService = createMock<UnitRichNoteService>();
      unitService.findAllExportSources.mockResolvedValue([{
        id: 3,
        metadata: null,
        scheme: JSON.stringify({ variableCodings: [{ id: 'd_1', alias: '05', sourceType: 'MANUAL' }] }),
        variables: [variable('05', '_00a', 'string')]
      }]);
      unitCommentService.findUnitIdsWithComments.mockResolvedValue(new Set());
      unitRichNoteService.findUnitIdsWithNotes.mockResolvedValue(new Set());

      const [contents] = await findUnitExportContents(5, unitService, unitCommentService, unitRichNoteService);

      expect(contents.variableIdConflicts.map(conflict => conflict.id)).toEqual(['05']);
    });

    // the export dialog warns about what makes the coding fail, not about what leaves it incomplete
    it('names what the schemer finds that makes the coding fail, and only that (#2135)', async () => {
      const unitService = createMock<UnitService>();
      const unitCommentService = createMock<UnitCommentService>();
      const unitRichNoteService = createMock<UnitRichNoteService>();
      unitService.findAllExportSources.mockResolvedValue([{
        id: 3,
        metadata: null,
        scheme: JSON.stringify({
          version: '3.0',
          variableCodings: [
            { id: 'text_a', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
            { id: 'text_b', alias: 'text_1', sourceType: 'BASE_NO_VALUE' },
            {
              id: 'drop_1', alias: '_01a', sourceType: 'BASE', codes: []
            }
          ]
        }),
        variables: [
          variable('text_a', 'text_1', 'no-value'),
          variable('text_b', 'text_1', 'no-value'),
          variable('drop_1', '_01a', 'string')
        ]
      }]);
      unitCommentService.findUnitIdsWithComments.mockResolvedValue(new Set());
      unitRichNoteService.findUnitIdsWithNotes.mockResolvedValue(new Set());

      const [contents] = await findUnitExportContents(5, unitService, unitCommentService, unitRichNoteService);

      // _01a without codes leaves the coding incomplete, but it runs
      expect(contents.schemeProblems).toEqual([{ type: 'NAME_TWICE', variable: 'text_1' }]);
    });
  });
});
