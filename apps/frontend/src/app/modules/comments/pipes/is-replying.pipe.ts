import { Pipe, PipeTransform } from '@angular/core';
import { ActiveComment, ActiveCommentType } from '../models/active-comment.interface';
import { Comment } from '../models/comment.interface';

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
