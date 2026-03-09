import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UntypedFormGroup, FormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CreateUserDto, UserFullDto, UserInListDto, WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

import { MatIcon } from '@angular/material/icon';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceGroupToCheckCollection } from '../../models/workspace-group-to-check-collection.class';
import { IsSelectedIdPipe } from '../../../../pipes/isSelectedId.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { UsersMenuComponent } from '../users-menu/users-menu.component';
import { EntriesDividerComponent } from '../../../shared/components/entries-divider/entries-divider.component';
import {
  BackendService
} from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  // eslint-disable-next-line max-len
  imports: [UsersMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatTooltip, FormsModule, TranslateModule, IsSelectedIdPipe, MatFabButton, MatIconButton, MatIcon, EntriesDividerComponent]
})
export class UsersComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UserFullDto>();
  displayedColumns = ['name', 'displayName', 'email', 'id', 'description', 'delete'];
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;
  userWorkspaceGroups = new WorkspaceGroupToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private deleteConfirmDialog: MatDialog
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedUser = r.added[0].id;
        } else {
          this.selectedUser = 0;
        }
        this.updateWorkspaceGroupList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createWorkspaceList();
    });
  }

  addUser(userData: UntypedFormGroup): void {
    this.appService.dataLoading = true;
    const user: CreateUserDto = {
      name: userData.get('name')?.value,
      password: userData.get('password')?.value,
      isAdmin: userData.get('isAdmin')?.value,
      description: userData.get('description')?.value,
      firstName: userData.get('firstName')?.value,
      lastName: userData.get('lastName')?.value,
      email: userData.get('email')?.value
    };
    this.backendService.addUser(user).subscribe(
      respOk => {
        this.updateUserList();
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('admin.user-created'),
            '',
            { duration: 1000 }
          );
        } else {
          this.snackBar.open(
            this.translateService.instant('admin.user-not-created'),
            this.translateService.instant('error'),
            { duration: 3000 });
        }
      }
    );
  }

  editUser(value: { selection: UserFullDto[], user: UntypedFormGroup }): void {
    this.appService.dataLoading = true;
    const id = value.selection[0].id;
    const newPassword: string = value.user.get('password')?.value;
    const newName: string = value.user.get('name')?.value;
    const newFirstName: string = value.user.get('firstName')?.value;
    const newLastName: string = value.user.get('lastName')?.value;
    const newEmail: string = value.user.get('email')?.value;
    const newDescription: string = value.user.get('description')?.value;
    const newIsAdmin: boolean = value.user.get('isAdmin')?.value;
    const changedData: UserFullDto = { id: id };
    if (newName !== value.selection[0].name) changedData.name = newName;
    if (newDescription !== value.selection[0].description) changedData.description = newDescription;
    if (newFirstName !== value.selection[0].firstName) changedData.firstName = newFirstName;
    if (newLastName !== value.selection[0].lastName) changedData.lastName = newLastName;
    if (newEmail !== value.selection[0].email) changedData.email = newEmail;
    if (newPassword) changedData.password = newPassword;
    if (newIsAdmin !== value.selection[0].isAdmin) changedData.isAdmin = newIsAdmin;
    this.backendService.changeUserData(id, changedData).subscribe(
      respOk => {
        this.updateUserList();
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('admin.user-edited'),
            '',
            { duration: 1000 }
          );
        } else {
          this.snackBar.open(
            this.translateService.instant('admin.user-not-edited'),
            this.translateService.instant('error'),
            { duration: 3000 });
        }
      }
    );
  }

  deleteUsers(users: UserFullDto[]): void {
    const content = (users.length === 1) ?
      this.translateService.instant('admin.delete-user', { name: users[0].name }) :
      this.translateService.instant('admin.delete-users', { count: users.length });
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('admin.delete-users-title'),
        content: content,
        confirmButtonLabel: this.translateService.instant('delete'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appService.dataLoading = true;
        const usersToDelete: number[] = [];
        users.forEach((r: UserFullDto) => usersToDelete.push(r.id));
        this.backendService.deleteUsers(usersToDelete).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open(
                this.translateService.instant('admin.users-deleted'),
                '',
                { duration: 1000 });
              this.updateUserList();
            } else {
              this.snackBar.open(
                this.translateService.instant('admin.users-not-deleted'),
                this.translateService.instant('error'),
                { duration: 3000 });
              this.appService.dataLoading = false;
            }
          }
        );
      }
    });
  }

  updateWorkspaceGroupList(): void {
    if (this.userWorkspaceGroups.hasChanged) {
      this.snackBar.open('Zugriffsrechte nicht gespeichert.', 'Warnung', { duration: 3000 });
    }
    if (this.selectedUser > 0) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspaceGroupsByAdmin(this.selectedUser).subscribe(
        (workspaceGroups: WorkspaceGroupInListDto[]) => {
          this.userWorkspaceGroups.setChecks(workspaceGroups);
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.userWorkspaceGroups.setChecks();
    }
  }

  saveWorkspaces(): void {
    if (this.selectedUser > 0) {
      if (this.userWorkspaceGroups.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspaceGroupsByAdmin(
          this.selectedUser, this.userWorkspaceGroups.getChecks()
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
              this.userWorkspaceGroups.setHasChangedFalse();
              this.userWorkspaceGroups.sortEntries();
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
      (users: UserFullDto[]) => {
        if (users.length > 0) {
          this.setObjectsDatasource(users);
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        } else {
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        }
      }
    );
  }

  private setObjectsDatasource(users: UserFullDto[]): void {
    this.objectsDatasource = new MatTableDataSource(users);
    this.objectsDatasource
      .filterPredicate = (userList: UserFullDto, filter) => [
        'name', 'firstName', 'lastName', 'email', 'id', 'description'
      ].some(column => (userList[column as keyof UserFullDto] || '')
        .toString()
        .toLowerCase()
        .includes(filter));
    this.objectsDatasource.sort = this.sort;
  }

  createWorkspaceList(): void {
    this.userWorkspaceGroups = new WorkspaceGroupToCheckCollection([]);
    this.backendService.getWorkspaceGroupList().subscribe(worksGroups => {
      this.userWorkspaceGroups = new WorkspaceGroupToCheckCollection(worksGroups);
      this.updateUserList();
    });
  }

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }
}
