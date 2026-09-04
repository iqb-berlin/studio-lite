import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

/**
 * Whether a unit has comments this user has not seen: the last comment is newer than the timestamp
 * stored for them. A unit nobody has opened yet carries no timestamp and is not marked as new.
 */
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
