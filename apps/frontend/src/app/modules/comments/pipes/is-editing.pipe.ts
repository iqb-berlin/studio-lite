import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';
import { ActiveComment, ActiveCommentType } from '../models/active-comment.interface';

/**
 * Whether this comment is the one currently being edited. Only one comment in the list is active at
 * a time, and its id and mode are held in a single object -- so both have to match.
 */
@Pipe({
  name: 'isEditing',
  standalone: true
})
export class IsEditingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(activeComment: ActiveComment | null, comment: Comment): boolean {
    if (!activeComment) {
      return false;
    }
    return (
      activeComment.id === comment.id &&
      activeComment.type === ActiveCommentType.editing
    );
  }
}
