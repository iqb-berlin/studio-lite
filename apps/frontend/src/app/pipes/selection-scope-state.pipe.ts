import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionScope, selectionScopeState, SelectionScopeState } from '../utils/selection-scope.utils';

/**
 * The header checkbox and the hidden selected entries of a filtered list, see
 * {@link selectionScopeState}. Model and data source are mutated in place; what makes the pure pipe
 * run again is `filteredData`, a new array whenever the filter or the data change, and
 * `selection.selected`, a new array after every change of the selection. A count would miss a
 * selection replaced by one of the same size.
 */
@Pipe({
  name: 'selectionScopeState',
  standalone: true
})
export class SelectionScopeStatePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<T>(
    selection: SelectionModel<T>,
    dataSource: MatTableDataSource<T>,
    scope: SelectionScope,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filteredData: T[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: T[]
  ): SelectionScopeState {
    return selectionScopeState(selection, dataSource, scope);
  }
}
