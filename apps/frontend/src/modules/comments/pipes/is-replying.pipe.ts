import { Pipe, PipeTransform } from '@angular/core';
import { ActiveComment, ActiveCommentType } from '../types/active.comment';
import { Comment } from '../types/comment';

@Pipe({
  name: 'isReplying'
})
export class IsReplyingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(activeComment: ActiveComment | null, comment: Comment): boolean {
    if (!activeComment) {
      return false;
    }
    return (
      activeComment.id === comment.id &&
      activeComment.type === ActiveCommentType.replying
    );
  }
}
