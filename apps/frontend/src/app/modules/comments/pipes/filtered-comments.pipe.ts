import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';

@Pipe({
  name: 'filteredComments',
  pure: false,
  standalone: true
})
export class FilteredCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(
    comments: Comment[], itemFilters: string[], voteFilters: string[] = []
  ): Comment[] {
    let filtered = comments;

    if (itemFilters && itemFilters.length > 0) {
      filtered = filtered.filter(comment => itemFilters
        .some(uuid => comment.itemUuids.includes(uuid) ||
          (!comment.itemUuids.length && itemFilters.includes('no-items')))
      );
    }

    if (voteFilters && voteFilters.length > 0) {
      filtered = filtered.filter(comment => {
        const matchesUp = voteFilters.includes('up') && (comment.upVotes || 0) > 0;
        const matchesDown = voteFilters.includes('down') && (comment.downVotes || 0) > 0;
        const matchesControversial = voteFilters.includes('controversial') &&
          (comment.upVotes || 0) > 0 && (comment.downVotes || 0) > 0;

        return matchesUp || matchesDown || matchesControversial;
      });
    }

    return filtered;
  }
}
