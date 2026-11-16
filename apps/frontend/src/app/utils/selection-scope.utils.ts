import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

/**
 * What the header checkbox of a filtered list acts on: the entries the filter shows, or all of
 * them, the hidden ones as well (#433). Filtering itself never changes the selection.
 */
export type SelectionScope = 'shown' | 'all';

export interface SelectionScopeState {
  // Nothing in scope: a click on the header checkbox would tick it without selecting anything.
  empty: boolean;
  checked: boolean;
  indeterminate: boolean;
  // Selected entries the filter hides, whatever the scope -- they are acted on all the same.
  hidden: number;
}

function rowsInScope<T>(dataSource: MatTableDataSource<T>, scope: SelectionScope): T[] {
  return scope === 'all' ? dataSource.data : dataSource.filteredData;
}

function hiddenSelected<T>(selection: SelectionModel<T>, dataSource: MatTableDataSource<T>): T[] {
  const shown = new Set(dataSource.filteredData);
  return selection.selected.filter(row => !shown.has(row));
}

/** The state of the header checkbox and the number of selected entries the filter hides. */
export function selectionScopeState<T>(
  selection: SelectionModel<T>,
  dataSource: MatTableDataSource<T>,
  scope: SelectionScope
): SelectionScopeState {
  const rows = rowsInScope(dataSource, scope);
  const selectedRows = rows.filter(row => selection.isSelected(row)).length;
  return {
    empty: !rows.length,
    checked: !!rows.length && selectedRows === rows.length,
    indeterminate: !!selectedRows && selectedRows < rows.length,
    hidden: hiddenSelected(selection, dataSource).length
  };
}

/**
 * The click on the header checkbox: deselects the entries in scope when all of them are selected,
 * and selects all of them otherwise -- a partly ticked box as well. Entries out of scope stay as
 * they are.
 */
export function toggleAllInScope<T>(
  selection: SelectionModel<T>,
  dataSource: MatTableDataSource<T>,
  scope: SelectionScope
): void {
  const rows = rowsInScope(dataSource, scope);
  if (rows.length && rows.every(row => selection.isSelected(row))) {
    selection.deselect(...rows);
  } else {
    selection.select(...rows);
  }
}

/** Deselects the selected entries the filter hides. */
export function deselectHidden<T>(selection: SelectionModel<T>, dataSource: MatTableDataSource<T>): void {
  selection.deselect(...hiddenSelected(selection, dataSource));
}
