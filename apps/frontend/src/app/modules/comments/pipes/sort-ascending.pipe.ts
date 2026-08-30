import { Pipe, PipeTransform } from '@angular/core';

/**
 * Sorts by one property, ascending, with empty values last. Sorts the array in place, so the caller
 * must not hand in one it needs in its original order.
 */
@Pipe({
  name: 'sortAscending',
  standalone: true
})

export class SortAscendingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<T>(items: T[], key: keyof T): T[] {
    return items.sort((a, b) => SortAscendingPipe
      .sortAscending(a, b, key));
  }

  static sortAscending<T>(a: T, b: T, key: keyof T): number {
    if (!a[key]) return 1;
    if (!b[key]) return -1;
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  }
}
