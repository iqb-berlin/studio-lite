import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../types/comment';
import { ActiveCommentInterface, ActiveCommentType } from '../types/active-comment.interface';

@Pipe({
  name: 'isEditing'
})
export class IsEditingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(activeComment: ActiveCommentInterface | null, comment: Comment): boolean {
    if (!activeComment) {
      return false;
    }
    return (
      activeComment.id === comment.id &&
      activeComment.type === ActiveCommentType.editing
    );
  }
}
