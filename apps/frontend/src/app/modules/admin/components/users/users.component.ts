import {
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
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf, NgFor } from '@angular/common';
import {
  BackendService
} from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceGroupToCheckCollection } from '../../models/workspace-group-to-check-collection.class';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { UsersMenuComponent } from '../users-menu/users-menu.component';

@Component({
  selector: 'studio-lite-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [UsersMenuComponent, NgIf, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButton, MatTooltip, WrappedIconComponent, NgFor, FormsModule, TranslateModule, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe, IsSelectedIdPipe]
})
export class UsersComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UserFullDto>();
  displayedColumns = ['selectCheckbox', 'name', 'displayName', 'email', 'description'];
  tableSelectionCheckboxes = new SelectionModel <UserFullDto>(true, []);
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;
  userWorkspaceGroups = new WorkspaceGroupToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
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
      this.appService.appConfig
        .setPageTitle(this.translateService.instant('admin.users-title'));
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
    const newPassword: string = value.user.get('password')?.value;
    const newName: string = value.user.get('name')?.value;
    const newFirstName: string = value.user.get('firstName')?.value;
    const newLastName: string = value.user.get('lastName')?.value;
    const newEmail: string = value.user.get('email')?.value;
    const newDescription: string = value.user.get('description')?.value;
    const newIsAdmin: boolean = value.user.get('isAdmin')?.value;
    const changedData: UserFullDto = { id: value.selection[0].id };
    if (newName !== value.selection[0].name) changedData.name = newName;
    if (newDescription !== value.selection[0].description) changedData.description = newDescription;
    if (newFirstName !== value.selection[0].firstName) changedData.firstName = newFirstName;
    if (newLastName !== value.selection[0].lastName) changedData.lastName = newLastName;
    if (newEmail !== value.selection[0].email) changedData.email = newEmail;
    if (newPassword) changedData.password = newPassword;
    if (newIsAdmin !== value.selection[0].isAdmin) changedData.isAdmin = newIsAdmin;
    this.backendService.changeUserData(changedData).subscribe(
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
          this.tableSelectionCheckboxes.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        } else {
          this.tableSelectionCheckboxes.clear();
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
        'name', 'firstName', 'lastName', 'email', 'description'
      ].some(column => (userList[column as keyof UserFullDto] as string || '')
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

  private isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckboxes.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckboxes.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckboxes.select(row));
  }

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }
}
