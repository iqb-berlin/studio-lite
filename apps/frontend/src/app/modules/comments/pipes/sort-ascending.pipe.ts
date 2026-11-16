import { Pipe, PipeTransform } from '@angular/core';
import { compareText } from '@studio-lite/shared-code';

/**
 * Sorts by one property, ascending, with empty values last; text in dictionary order, as the API
 * sorts it (#1872). Sorts the array in place, so the caller must not hand in one it needs in its
 * original order.
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
    const valueA = a[key];
    const valueB = b[key];
    if (!valueA && !valueB) return 0;
    if (!valueA) return 1;
    if (!valueB) return -1;
    if (typeof valueA === 'string' && typeof valueB === 'string') return compareText(valueA, valueB);
    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  }
}
