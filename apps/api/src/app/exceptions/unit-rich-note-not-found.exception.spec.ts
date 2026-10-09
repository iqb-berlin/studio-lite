import { UnitRichNoteNotFoundException } from './unit-rich-note-not-found.exception';

describe('UnitRichNoteNotFoundException', () => {
  it('should be defined', () => {
    const exception = new UnitRichNoteNotFoundException(1, 'PATCH');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'unit-rich-note',
      method: 'PATCH',
      description: 'Rich note with id 1 not found'
    });
  });
});
