import { Pipe, PipeTransform } from '@angular/core';
import { ActiveCommentInterface, ActiveCommentType } from '../types/active-comment.interface';
import { Comment } from '../types/comment';

@Pipe({
  name: 'isReplying'
})
export class IsReplyingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(activeComment: ActiveCommentInterface | null, comment: Comment): boolean {
    if (!activeComment) {
      return false;
    }
    return (
      activeComment.id === comment.id &&
      activeComment.type === ActiveCommentType.replying
    );
  }
}
