import { Pipe, PipeTransform } from '@angular/core';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';

@Pipe({
  name: 'filteredRootComments',
  pure: false,
  standalone: true
})
export class FilteredRootCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(rootComments: RootCommentWithReplies[], itemFilters: string[]): RootCommentWithReplies[] {
    if (itemFilters.length === 0) return rootComments;
    return rootComments.filter(rootComment => itemFilters
      .some(uuid => rootComment.rootComment.itemUuids.includes(uuid) ||
        (!rootComment.rootComment.itemUuids.length && itemFilters.includes('no-items')) ||
        rootComment.replies
          .some(reply => reply.itemUuids.includes(uuid) ||
            (!reply.itemUuids.length && itemFilters.includes('no-items'))))
    );
  }
}
