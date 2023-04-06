import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  UserFullDto, UserInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import {
  BackendService
} from '../backend.service';
import { AppService } from '../../../services/app.service';
import { WorkspaceToCheckCollection } from '../workspaces/workspaceChecked';
import { WsgAdminService } from '../wsg-admin.service';

@Component({
  templateUrl: './users.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class UsersComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UserFullDto>();
  displayedColumns = ['selectCheckbox', 'name', 'displayName', 'email', 'description'];
  tableSelectionCheckbox = new SelectionModel <UserFullDto>(true, []);
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;

  userWorkspaces = new WorkspaceToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private wsgAdminService: WsgAdminService,
    private newUserDialog: MatDialog,
    private newPasswordDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private editUserDialog: MatDialog,
    private confirmDialog: MatDialog,
    private superadminPasswordDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedUser = r.added[0].id;
        } else {
          this.selectedUser = 0;
        }
        this.updateWorkspaceList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createWorkspaceList();
    });
  }

  updateWorkspaceList(): void {
    if (this.userWorkspaces.hasChanged) {
      this.snackBar.open('Zugriffsrechte nicht gespeichert.', 'Warnung', { duration: 3000 });
    }
    if (this.selectedUser > 0) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspacesByUser(this.selectedUser).subscribe(
        (dataResponse: WorkspaceInListDto[]) => {
          this.userWorkspaces.setChecks(dataResponse);
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.userWorkspaces.setChecks();
    }
  }

  saveWorkspaces(): void {
    if (this.selectedUser > 0) {
      if (this.userWorkspaces.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspacesByUser(
          this.selectedUser, this.userWorkspaces.getChecks(), this.wsgAdminService.selectedWorkspaceGroupId
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
              this.userWorkspaces.setHasChangedFalse();
            } else {
              this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
            }
            this.appService.dataLoading = false;
          }
        );
      }
    }
  }

  updateUserList(): void {
    this.selectedUser = 0;
    this.appService.dataLoading = true;
    this.backendService.getUsersFull().subscribe(
      (dataResponse: UserFullDto[]) => {
        if (dataResponse.length > 0) {
          this.objectsDatasource = new MatTableDataSource(dataResponse);
          this.objectsDatasource.sort = this.sort;
          this.tableSelectionCheckbox.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        } else {
          this.tableSelectionCheckbox.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        }
      }
    );
  }

  createWorkspaceList(): void {
    this.userWorkspaces = new WorkspaceToCheckCollection([]);
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId).subscribe(workspaces => {
      this.userWorkspaces = new WorkspaceToCheckCollection(workspaces);
      this.updateUserList();
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckbox.select(row));
  }

  selectRow(row: UserInListDto): void {
    this.tableSelectionRow.select(row);
  }
}
