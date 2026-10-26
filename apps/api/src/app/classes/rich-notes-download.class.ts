import { UnitRichNoteDto, UnitRichNoteLinkDto, UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';

// Rich note shape as defined by the iqb unit-rich-notes@0.2 specification
// (https://github.com/iqb-specifications/unit-rich-notes). links and itemUuids
// have minItems: 1, so they must be omitted rather than emitted empty.
interface UnitRichNoteJson {
  tagId: string;
  tagLabel?: string;
  content: string;
  links?: UnitRichNoteLinkDto[];
  itemUuids?: string[];
}

/**
 * The rich notes of a unit in the iqb unit-rich-notes@0.2 shape, written by both export formats --
 * as `.vorn` beside the XML unit and as `.vorn.json` beside the JSON one.
 */
export class RichNotesDownloadClass {
  static findTag(
    tags: UnitRichNoteTagDto[],
    tagId: string
  ): UnitRichNoteTagDto | null {
    if (!tagId) return null;

    const findTagRecursive = (
      currentTags: UnitRichNoteTagDto[]
    ): UnitRichNoteTagDto | undefined => {
      let found: UnitRichNoteTagDto | undefined = currentTags.find(
        tag => tag.id === tagId || tag.id.endsWith(`#${tagId}`)
      );
      if (!found) {
        currentTags.forEach(tag => {
          if (!found && tag.children?.length) {
            found = findTagRecursive(tag.children);
          }
        });
      }
      return found;
    };

    const foundTag = findTagRecursive(tags);
    if (foundTag) return foundTag;

    return tagId.split('.').reduce<{
      tags: UnitRichNoteTagDto[];
      tag: UnitRichNoteTagDto | null;
    }>(
      (acc, segment) => {
        const found = acc.tags.find(t => t.id === segment || t.id.endsWith(`#${segment}`));
        return {
          tags: found?.children || [],
          tag: found || null
        };
      },
      { tags, tag: null }
    ).tag;
  }

  static getLabelString(
    labels: { lang: string; value: string }[] | null | undefined
  ): string | null {
    if (!labels || labels.length === 0) return null;
    const de = labels.find(l => l.lang === 'de');
    if (de) return de.value;
    const en = labels.find(l => l.lang === 'en');
    if (en) return en.value;
    return labels[0].value;
  }

  /**
   * Maps internal rich note DTOs onto the iqb unit-rich-notes@0.2 spec shape. links and itemUuids
   * are only emitted when non-empty: the spec requires minItems: 1, so an empty/null array would
   * make the file schema-invalid.
   */
  static transformRichNotes(
    notes: UnitRichNoteDto[],
    tags: UnitRichNoteTagDto[]
  ): UnitRichNoteJson[] {
    return notes.map(note => {
      const tag = RichNotesDownloadClass.findTag(tags, note.tagId);
      const transformed: UnitRichNoteJson = {
        tagId: tag ? tag.id : note.tagId,
        content: note.content
      };
      const tagLabel = RichNotesDownloadClass.getLabelString(tag?.label);
      if (tagLabel) transformed.tagLabel = tagLabel;
      if (note.links?.length) transformed.links = note.links;
      if (note.itemReferences?.length) transformed.itemUuids = note.itemReferences;
      return transformed;
    });
  }
}
