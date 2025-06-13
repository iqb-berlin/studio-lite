import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';

@Pipe({
  name: 'replies',
  pure: false,
  standalone: true
})
export class RepliesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[], commentId: number): Comment[] {
    return comments
      .filter(comment => comment.parentId === commentId);
  }
}
