import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import {
  deselectHidden, SelectionScope, selectionScopeState, toggleAllInScope
} from './selection-scope.utils';
import { TextSortTableDataSource } from '../models/text-sort-table-data-source.class';

// Whether the header checkbox of a filtered list acts on the shown entries or on all of them (#433)
describe('selection scope', () => {
  interface Row { key: string; group: string }
  const a1: Row = { key: 'A1', group: 'a' };
  const a2: Row = { key: 'A2', group: 'a' };
  const b1: Row = { key: 'B1', group: 'b' };
  const b2: Row = { key: 'B2', group: 'b' };

  let dataSource: MatTableDataSource<Row>;
  let selection: SelectionModel<Row>;

  const select = (...rows: Row[]): void => { selection.select(...rows); };
  const selectedKeys = (): string[] => selection.selected.map(row => row.key).sort();

  beforeEach(() => {
    dataSource = new TextSortTableDataSource([a1, a2, b1, b2]);
    dataSource.filterPredicate = (row, filter) => row.group === filter;
    selection = new SelectionModel<Row>(true);
  });

  describe('state of the header checkbox', () => {
    it.each<[SelectionScope, Row[], boolean, boolean]>([
      ['shown', [], false, false],
      ['shown', [a1], false, true],
      ['shown', [a1, a2], true, false],
      ['shown', [b1], false, false],
      ['all', [a1, a2], false, true],
      ['all', [a1, a2, b1, b2], true, false]
    ])('in scope %s with %j selected: checked %s, indeterminate %s', (scope, rows, checked, indeterminate) => {
      dataSource.filter = 'a';
      select(...rows);

      const state = selectionScopeState(selection, dataSource, scope);

      expect([state.checked, state.indeterminate]).toEqual([checked, indeterminate]);
    });

    it.each<SelectionScope>(['shown', 'all'])('counts the selected entries the filter hides in scope %s', scope => {
      dataSource.filter = 'a';
      select(a1, b1, b2);

      expect(selectionScopeState(selection, dataSource, scope).hidden).toBe(2);
    });

    it('is empty and not checked when the filter shows nothing', () => {
      dataSource.filter = 'c';

      expect(selectionScopeState(selection, dataSource, 'shown'))
        .toEqual({
          empty: true, checked: false, indeterminate: false, hidden: 0
        });
      expect(selectionScopeState(selection, dataSource, 'all').empty).toBe(false);
    });
  });

  describe('click on the header checkbox', () => {
    it.each<[SelectionScope, Row[], string[]]>([
      ['shown', [], ['A1', 'A2']],
      ['shown', [a1, b1], ['A1', 'A2', 'B1']],
      ['shown', [a1, a2, b1], ['B1']],
      ['all', [], ['A1', 'A2', 'B1', 'B2']],
      ['all', [a1, a2], ['A1', 'A2', 'B1', 'B2']],
      ['all', [a1, a2, b1, b2], []]
    ])('in scope %s with %j selected leaves %j selected', (scope, rows, keys) => {
      dataSource.filter = 'a';
      select(...rows);

      toggleAllInScope(selection, dataSource, scope);

      expect(selectedKeys()).toEqual(keys);
    });

    it('selects nothing when the filter shows nothing', () => {
      dataSource.filter = 'c';

      toggleAllInScope(selection, dataSource, 'shown');

      expect(selection.hasValue()).toBe(false);
    });
  });

  it('deselects the selected entries the filter hides, and only them', () => {
    dataSource.filter = 'a';
    select(a1, b1, b2);

    deselectHidden(selection, dataSource);

    expect(selectedKeys()).toEqual(['A1']);
  });
});
