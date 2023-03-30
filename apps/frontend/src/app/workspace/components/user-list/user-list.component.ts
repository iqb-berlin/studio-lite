import {
  AfterViewInit, Component, Input, ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserInListDto } from '@studio-lite-lib/api-dto';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'user-list',
  templateUrl: 'user-list.component.html',
  styleUrls: ['user-list.component.scss']
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
