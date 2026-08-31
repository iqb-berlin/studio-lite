import { Pipe, PipeTransform } from '@angular/core';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';

/**
 * How many comments are hidden from the review, replies included -- a hidden root comment takes its
 * whole thread with it. What the "n hidden" line above the list counts.
 */
@Pipe({
  name: 'hiddenCommentsCount',
  pure: false,
  standalone: true
})
export class HiddenCommentsCountPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: RootCommentWithReplies[]): number {
    if (!comments) return 0;
    return comments.reduce((acc, comment) => {
      if (comment.rootComment.hidden) {
        return acc + 1 + comment.replies.length;
      }
      return acc + comment.replies.filter(r => r.hidden).length;
    }, 0);
  }
}
