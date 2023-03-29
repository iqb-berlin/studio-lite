import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isCommentCommitable'
})
export class IsCommentCommitablePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(editorHTML: string): boolean {
    return !!editorHTML && editorHTML !== '<p></p>';
  }
}
