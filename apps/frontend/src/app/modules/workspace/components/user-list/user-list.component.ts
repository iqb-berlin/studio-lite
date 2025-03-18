import {
  AfterViewInit, Component, Input, ViewChild
} from '@angular/core';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { UserInListDto } from '@studio-lite-lib/api-dto';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'studio-lite-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    // eslint-disable-next-line max-len
    imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, TranslateModule]
})
export class UserListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  objectsDatasource: MatTableDataSource<UserInListDto> = new MatTableDataSource();
  displayedColumns = ['displayName', 'email', 'description'];
  @Input('users')
  set userList(value: UserInListDto[]) {
    this.objectsDatasource = new MatTableDataSource(value);
  }

  ngAfterViewInit(): void {
    this.objectsDatasource.sort = this.sort;
  }
}
