import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { compareText } from '@studio-lite/shared-code';

/** What a row holds in a column, as it is. */
const valueAsHeld = <T>(data: T, sortHeaderId: string): string | number => (
  (data as Record<string, string | number>)[sortHeaderId]
);

/**
 * The data source of the studio's tables. It sorts as Material's does, with two differences:
 *
 * - Text is ordered by {@link compareText}, the comparison the API sorts its lists with. Several
 *   tables show the order the API sent until a header is clicked, and the rows must not move on
 *   that click (#1872).
 * - Text that looks like a number stays text. Material turns it into a number first, which read the
 *   item ids `1.9` and `1.10` as decimals and put them the other way round than every other list. A
 *   column that holds numbers as text and wants them read as numbers sets its own
 *   `sortingDataAccessor`.
 *
 * Values of other types -- numbers, booleans -- are compared as before, and rows without a value
 * come first.
 */
export class TextSortTableDataSource<T> extends MatTableDataSource<T> {
  override sortingDataAccessor: (data: T, sortHeaderId: string) => string | number = valueAsHeld;

  override sortData = (data: T[], sort: MatSort): T[] => {
    const { active, direction } = sort;
    if (!active || direction === '') return data;
    const factor = direction === 'asc' ? 1 : -1;
    return data.sort((a, b) => factor * TextSortTableDataSource.compareValues(
      this.sortingDataAccessor(a, active),
      this.sortingDataAccessor(b, active)
    ));
  };

  private static compareValues(a: unknown, b: unknown): number {
    const hasA = a !== null && a !== undefined;
    const hasB = b !== null && b !== undefined;
    if (!hasA || !hasB) return Number(hasA) - Number(hasB);
    if (typeof a === 'string' || typeof b === 'string') return compareText(String(a), String(b));
    if ((a as number) < (b as number)) return -1;
    return (a as number) > (b as number) ? 1 : 0;
  }
}
