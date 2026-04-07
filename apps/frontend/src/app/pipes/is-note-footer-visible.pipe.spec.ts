import { UnitRichNoteDto } from '@studio-lite-lib/api-dto';
import { IsNoteFooterVisiblePipe } from './is-note-footer-visible.pipe';

describe('IsNoteFooterVisiblePipe', () => {
  let pipe: IsNoteFooterVisiblePipe;

  beforeEach(() => {
    pipe = new IsNoteFooterVisiblePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if note has itemReferences', () => {
    const note = { itemReferences: ['item-1'], links: [] } as unknown as UnitRichNoteDto;
    expect(pipe.transform(note)).toBe(true);
  });

  it('should return true if note has links', () => {
    const note = { itemReferences: [], links: [{ url: 'http://test.com' }] } as unknown as UnitRichNoteDto;
    expect(pipe.transform(note)).toBe(true);
  });

  it('should return false if note has neither itemReferences nor links', () => {
    const note = { itemReferences: [], links: [] } as unknown as UnitRichNoteDto;
    expect(pipe.transform(note)).toBe(false);
  });

  it('should return false if note is undefined', () => {
    expect(pipe.transform(undefined)).toBe(false);
  });

  it('should return false if note is null', () => {
    expect(pipe.transform(null)).toBe(false);
  });

  it('should return false if note has undefined properties', () => {
    const note = {} as unknown as UnitRichNoteDto;
    expect(pipe.transform(note)).toBe(false);
  });
});
