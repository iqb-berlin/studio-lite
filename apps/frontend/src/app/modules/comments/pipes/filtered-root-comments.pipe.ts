import { Pipe, PipeTransform } from '@angular/core';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';

@Pipe({
  name: 'filteredRootComments',
  pure: false,
  standalone: true
})
export class FilteredRootCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(rootComments: RootCommentWithReplies[], itemFilters: string[], voteFilters: string[] = []): RootCommentWithReplies[] {
    let filtered = rootComments;

    if (itemFilters && itemFilters.length > 0) {
      filtered = filtered.filter(rootComment => itemFilters
        .some(uuid => rootComment.rootComment.itemUuids.includes(uuid) ||
          (!rootComment.rootComment.itemUuids.length && itemFilters.includes('no-items')) ||
          rootComment.replies
            .some(reply => reply.itemUuids.includes(uuid) ||
              (!reply.itemUuids.length && itemFilters.includes('no-items'))))
      );
    }

    if (voteFilters && voteFilters.length > 0) {
      filtered = filtered.filter(rootComment => {
        const matches = (c: any) => (
          (voteFilters.includes('up') && (c.upVotes || 0) > 0) ||
          (voteFilters.includes('down') && (c.downVotes || 0) > 0) ||
          (voteFilters.includes('controversial') && (c.upVotes || 0) > 0 && (c.downVotes || 0) > 0)
        );

        return matches(rootComment.rootComment) || rootComment.replies.some(reply => matches(reply));
      });
    }

    return filtered;
  }
}
