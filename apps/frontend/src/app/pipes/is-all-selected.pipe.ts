import { Pipe, PipeTransform } from '@angular/core';

/** Whether every row of a table is selected -- what the header checkbox shows. */
@Pipe({
  name: 'isAllSelected',
  standalone: true
})
export class IsAllSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(selectionCount: number, total: number): boolean {
    return IsAllSelectedPipe.isAllSelected(selectionCount, total);
  }

  static isAllSelected(selectionCount: number, total: number): boolean {
    return selectionCount === total;
  }
}
