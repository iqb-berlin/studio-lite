import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether the editor holds anything worth saving. An empty rich-text editor is not an empty string
 * but an empty paragraph, which is why that exact markup counts as nothing written.
 */
@Pipe({
  name: 'isCommentCommittable',
  standalone: true
})
export class IsCommentCommittablePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(editorHTML: string): boolean {
    return !!editorHTML && editorHTML !== '<p></p>';
  }
}
