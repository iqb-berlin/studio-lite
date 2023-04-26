import { Pipe, PipeTransform } from '@angular/core';
import { Comment } from '../models/comment.interface';

@Pipe({
  name: 'rootComments',
  pure: false
})
export class RootCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[]): Comment[] {
    return comments.filter(comment => comment.parentId === null);
  }
}
