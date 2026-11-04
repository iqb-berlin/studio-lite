import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';

/**
 * The comments of a unit as threads: each root comment with its replies, both in the order the API
 * hands them over. A reply always answers a root comment (the API takes no reply to a reply), so one
 * level is all there is.
 *
 * Every list that shows replies goes through here -- the discussion as well as the info panel of a
 * review and the printout. The latter two used to put each reply after the comment written just
 * before it, which made a late reply look like an answer to the wrong comment (#2109).
 *
 * A reply whose parent is no root comment of the list -- missing, or a reply itself -- is left out, as
 * it always was in the discussion; only data from before #1776, which took the parent from the body
 * unchecked, can hold such a reply.
 *
 * Pure: both callers replace the list when they load it again.
 */
@Pipe({
  name: 'rootCommentsWithReplies',
  standalone: true
})
export class RootCommentsWithRepliesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[] | null | undefined): RootCommentWithReplies[] {
    if (!comments) return [];
    return comments
      .filter(comment => comment.parentId === null)
      .map(rootComment => ({
        rootComment,
        replies: comments.filter(reply => reply.parentId === rootComment.id)
      }));
  }
}
