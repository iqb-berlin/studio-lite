import { MatSort } from '@angular/material/sort';
import { TextSortTableDataSource } from './text-sort-table-data-source.class';

interface Row {
  value?: string | number | boolean | null;
}

const sortedValues = (
  values: Row['value'][],
  direction: 'asc' | 'desc' | '' = 'asc',
  dataSource = new TextSortTableDataSource<Row>()
): Row['value'][] => dataSource
  .sortData(values.map(value => ({ value })), { active: 'value', direction } as MatSort)
  .map(row => row.value);

describe('TextSortTableDataSource (#1872)', () => {
  it('orders text as a dictionary does', () => {
    expect(sortedValues(['Zusatz', 'lesen', 'Ökologie', 'Aa01', 'aa02', 'Ab01', 'Unit10', 'Unit2']))
      .toEqual(['Aa01', 'aa02', 'Ab01', 'lesen', 'Ökologie', 'Unit2', 'Unit10', 'Zusatz']);
  });

  it('reverses the order when sorting descending', () => {
    expect(sortedValues(['b', 'A', 'ä'], 'desc')).toEqual(['b', 'ä', 'A']);
  });

  it('leaves text that looks like a number text', () => {
    // as numbers 1.10 came before 1.9 -- the other way round than the API sends item ids
    expect(sortedValues(['1.10', '10', '1.9', '9', '01'])).toEqual(['01', '1.9', '1.10', '9', '10']);
  });

  it('compares numbers and booleans by their value', () => {
    expect(sortedValues([10, 9, 100, 0])).toEqual([0, 9, 10, 100]);
    expect(sortedValues([true, false, true])).toEqual([false, true, true]);
  });

  it('puts rows without a value first', () => {
    expect(sortedValues(['b', null, '', undefined, 'A'])).toEqual([null, undefined, '', 'A', 'b']);
    expect(sortedValues([3, null, 1])).toEqual([null, 1, 3]);
  });

  it('keeps the given order while no column is sorted', () => {
    expect(sortedValues(['b', 'A', 'c'], '')).toEqual(['b', 'A', 'c']);
  });

  it('sorts by what a sortingDataAccessor of the table returns', () => {
    const dataSource = new TextSortTableDataSource<Row>();
    dataSource.sortingDataAccessor = row => Number(row.value);
    expect(sortedValues(['0.5', '0.25', '10', '2'], 'asc', dataSource)).toEqual(['0.25', '0.5', '2', '10']);
  });
});
