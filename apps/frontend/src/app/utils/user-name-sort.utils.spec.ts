import { MatSort } from '@angular/material/sort';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { TextSortTableDataSource } from '../models/text-sort-table-data-source.class';
import { sortNameColumnAsShown } from './user-name-sort.utils';

describe('sortNameColumnAsShown (#2145)', () => {
  const users = [
    { id: 1, name: 'bert' },
    {
      id: 2, name: 'zoe', lastName: 'Abel', firstName: 'Zoe'
    },
    {
      id: 3, name: 'anna', lastName: 'Zimmer', firstName: 'Anna'
    },
    { id: 4, name: 'Carla' }
  ] as UserFullDto[];
  const sortedIds = (column: string): number[] => {
    const dataSource = new TextSortTableDataSource(users);
    sortNameColumnAsShown(dataSource);
    return dataSource.sortData([...users], { active: column, direction: 'asc' } as MatSort).map(user => user.id);
  };

  it('should sort the name column by the name shown, a login name among the last names', () => {
    // Abel, Zoe -- bert -- Carla -- Zimmer, Anna
    expect(sortedIds('lastName')).toEqual([2, 1, 4, 3]);
  });

  it('should leave the other columns to their own values', () => {
    expect(sortedIds('name')).toEqual([3, 1, 4, 2]);
  });
});
