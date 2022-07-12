import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../types/comment';

@Pipe({
  name: 'replies',
  pure: false
})
export class RepliesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[], commentId: number): Comment[] {
    return comments
      .filter(comment => comment.parentId === commentId);
  }
}
