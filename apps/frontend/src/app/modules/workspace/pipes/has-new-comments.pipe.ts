import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

@Pipe({
    name: 'hasNewComments',
    standalone: true
})
export class HasNewCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(unit: UnitInListDto): boolean {
    return !!unit.lastCommentChangedAt &&
        !!unit.lastSeenCommentChangedAt &&
        (unit.lastCommentChangedAt > unit.lastSeenCommentChangedAt);
  }
}
