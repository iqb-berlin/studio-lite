import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { findRootTag } from './rich-note-tags.utils';

const tag = (id: string, children: UnitRichNoteTagDto[] = []): UnitRichNoteTagDto => ({
  id, label: [{ lang: 'de', value: id }], children
});

describe('findRootTag', () => {
  // The ids of a vocabulary are URLs, so the path cannot be read off them (#2006)
  it('finds the top-level tag of a vocabulary tag further down', () => {
    const transcript = tag('https://w3id.org/iqb/v06/t1/transcript', [
      tag('https://w3id.org/iqb/v06/t1/original', [tag('https://w3id.org/iqb/v06/t1/deep')])
    ]);
    const guide = tag('https://w3id.org/iqb/v06/t1/didactical_guide');

    expect(findRootTag([guide, transcript], 'https://w3id.org/iqb/v06/t1/deep')).toBe(transcript);
  });

  it('finds the top-level tag of a tag with a dotted id', () => {
    const t1 = tag('t1', [tag('t1.a')]);

    expect(findRootTag([tag('t2'), t1], 't1.a')).toBe(t1);
  });

  it('finds no tag for an id outside the tree', () => {
    expect(findRootTag([tag('t1', [tag('t1.a')])], 't1.b')).toBeUndefined();
  });
});
