import { Pipe, PipeTransform } from '@angular/core';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';

@Pipe({
  name: 'filteredRootComments',
  pure: false,
  standalone: true
})
export class FilteredRootCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(rootComments: RootCommentWithReplies[], uuids: string[]): RootCommentWithReplies[] {
    if (uuids.length === 0) return rootComments;
    return rootComments.filter(rootComment => uuids
      .some(uuid => rootComment.rootComment.itemUuids.includes(uuid) ||
        rootComment.replies.some(reply => reply.itemUuids.includes(uuid)))
    );
  }
}
