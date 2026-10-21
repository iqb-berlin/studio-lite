import { NotFoundException } from '@nestjs/common';

/** No rich note with this id under the unit it was asked for -- one of another unit is not found either. */
export class UnitRichNoteNotFoundException extends NotFoundException {
  constructor(noteId: number, method: string) {
    const description = `Rich note with id ${noteId} not found`;
    const objectOrError = {
      id: noteId,
      controller: 'unit-rich-note',
      method,
      description
    };
    super(objectOrError);
  }
}
