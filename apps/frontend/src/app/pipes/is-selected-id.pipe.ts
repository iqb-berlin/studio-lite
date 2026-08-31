import { Pipe, PipeTransform } from '@angular/core';

/** Whether an element carries the selected id -- the row highlight in a list. */
@Pipe({
  name: 'isSelectedId',
  standalone: true
})
export class IsSelectedIdPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-explicit-any
  transform(element: any, id: number): boolean {
    return element.id === id;
  }
}
