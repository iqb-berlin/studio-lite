import { MatTableDataSource } from '@angular/material/table';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { UserFullNamePipe } from '../pipes/user-full-name.pipe';

/**
 * Lets the name column of a user table sort by the text it shows. Its sort id is `lastName`, and
 * sorted by that field alone, the users without a last name -- listed under their login name --
 * stood in a block in front of all others, in no order of their own (#2145).
 */
export function sortNameColumnAsShown(dataSource: MatTableDataSource<UserFullDto>): void {
  const valueOf = dataSource.sortingDataAccessor;
  dataSource.sortingDataAccessor = (user, column) => (
    column === 'lastName' ? UserFullNamePipe.fullName(user) : valueOf(user, column)
  );
}
