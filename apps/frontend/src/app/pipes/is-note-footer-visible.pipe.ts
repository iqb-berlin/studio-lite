import { Pipe, PipeTransform } from '@angular/core';
import { UnitRichNoteDto } from '@studio-lite-lib/api-dto';

@Pipe({
  name: 'isNoteFooterVisible',
  standalone: true
})
export class IsNoteFooterVisiblePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(note: UnitRichNoteDto | null | undefined): boolean {
    if (!note) return false;
    return !!((note.itemReferences && note.itemReferences.length > 0) ||
           (note.links && note.links.length > 0));
  }
}
