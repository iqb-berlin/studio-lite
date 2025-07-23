import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';

@Pipe({
  name: 'filteredComments',
  pure: false,
  standalone: true
})
export class FilteredCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[], uuids: string[]): Comment[] {
    if (uuids.length === 0) return comments;
    return comments.filter(comment => uuids
      .some(uuid => comment.itemUuids.includes(uuid))
    );
  }
}
