import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';

const holds = (tag: UnitRichNoteTagDto, tagId: string): boolean => tag.id === tagId ||
  (tag.children || []).some(child => holds(child, tagId));

/**
 * The top-level tag a tag sits under, found through the tree: the ids of a vocabulary are URLs, and
 * the path to a tag cannot be read off its id (#2006).
 */
export function findRootTag(tags: UnitRichNoteTagDto[], tagId: string): UnitRichNoteTagDto | undefined {
  return tags.find(tag => holds(tag, tagId));
}
