import { Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserInListDto } from '@studio-lite-lib/api-dto';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'user-list',
  template: `
    <mat-table [dataSource]="objectsDatasource" matSort class="unit-list">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef mat-sort-header="displayName">Name</mat-header-cell>
        <mat-cell *matCellDef="let element">{{element.displayName}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="email">
        <mat-header-cell *matHeaderCellDef mat-sort-header="email">E-Mail</mat-header-cell>
        <mat-cell *matCellDef="let element">
          {{element.email}}
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef mat-sort-header="description">Notiz/Beschreibung</mat-header-cell>
        <mat-cell *matCellDef="let element">
          {{element.description}}
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
  `
})
export class UserListComponent {
  objectsDatasource = new MatTableDataSource<UserInListDto>();
  displayedColumns = ['name', 'email', 'description'];
  @Input('users')
  set userList(value: UserInListDto[]) {
    this.objectsDatasource = new MatTableDataSource(value);
    this.objectsDatasource.sort = this.sort;
  }

  @ViewChild(MatSort) sort = new MatSort();
}
