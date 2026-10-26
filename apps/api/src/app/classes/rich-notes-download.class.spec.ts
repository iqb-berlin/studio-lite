import { UnitRichNoteDto, UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { RichNotesDownloadClass } from './rich-notes-download.class';

describe('RichNotesDownloadClass', () => {
  describe('findTag and getLabelString', () => {
    const unitDownloadClass = RichNotesDownloadClass as unknown as {
      findTag: (tags: UnitRichNoteTagDto[], id: string) => UnitRichNoteTagDto;
      getLabelString: (label: { lang: string; value: string }[] | null) => string | null;
    };
    const tags = [
      {
        id: 't1',
        label: [{ lang: 'de', value: 'Label 1' }],
        children: [
          {
            id: 'c1',
            label: [{ lang: 'de', value: 'Label 1.1' }]
          }
        ]
      },
      {
        id: 'https://example.com/vocab/t2',
        label: [{ lang: 'de', value: 'Label 2' }]
      }
    ];

    it('should find tag by exact ID recursively', () => {
      const tag = unitDownloadClass.findTag(tags, 'c1');
      expect(tag.id).toBe('c1');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 1.1');
    });

    it('should find tag by URL ID', () => {
      const tag = unitDownloadClass.findTag(tags, 'https://example.com/vocab/t2');
      expect(tag.id).toBe('https://example.com/vocab/t2');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 2');
    });

    it('should find tag by legacy dot-separated path', () => {
      const tag = unitDownloadClass.findTag(tags, 't1.c1');
      expect(tag.id).toBe('c1');
      expect(unitDownloadClass.getLabelString(tag.label)).toBe('Label 1.1');
    });

    it('should return null if tagId is not found', () => {
      const tag = unitDownloadClass.findTag(tags, 'nonexistent');
      expect(tag).toBeNull();
    });

    it('should return null if tagId is empty', () => {
      const tag = unitDownloadClass.findTag(tags, '');
      expect(tag).toBeNull();
    });

    it('should handle missing labels in getLabelString', () => {
      expect(unitDownloadClass.getLabelString(null)).toBeNull();
      expect(unitDownloadClass.getLabelString([])).toBeNull();
    });
  });

  describe('transformRichNotes', () => {
    it('should map a note onto the unit-rich-notes spec shape', () => {
      const notes = [{
        tagId: 'tag-1',
        content: '<p>note</p>',
        links: [{ url: 'https://example.org', label: 'Ref' }],
        itemReferences: ['item-uuid-1']
      }] as unknown as UnitRichNoteDto[];
      const tags = [
        { id: 'tag-1', label: [{ lang: 'de', value: 'Tag Label' }] }
      ] as unknown as UnitRichNoteTagDto[];

      const result = RichNotesDownloadClass.transformRichNotes(notes, tags);

      expect(result).toEqual([{
        tagId: 'tag-1',
        tagLabel: 'Tag Label',
        content: '<p>note</p>',
        links: [{ url: 'https://example.org', label: 'Ref' }],
        itemUuids: ['item-uuid-1']
      }]);
    });

    it('should omit links and itemUuids when empty (spec minItems: 1)', () => {
      const notes = [{
        tagId: 'tag-1',
        content: 'note',
        links: [],
        itemReferences: []
      }] as unknown as UnitRichNoteDto[];

      const result = RichNotesDownloadClass.transformRichNotes(notes, []);

      expect(result[0]).not.toHaveProperty('links');
      expect(result[0]).not.toHaveProperty('itemUuids');
      expect(result[0]).not.toHaveProperty('tagLabel');
      expect(result[0]).toEqual({ tagId: 'tag-1', content: 'note' });
    });

    it('should omit links when the column is null', () => {
      const notes = [{
        tagId: 'tag-1',
        content: 'note',
        links: null,
        itemReferences: ['item-uuid-1']
      }] as unknown as UnitRichNoteDto[];

      const result = RichNotesDownloadClass.transformRichNotes(notes, []);

      expect(result[0]).not.toHaveProperty('links');
      expect(result[0].itemUuids).toEqual(['item-uuid-1']);
    });
  });
});
