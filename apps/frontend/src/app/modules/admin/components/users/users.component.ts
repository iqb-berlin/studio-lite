import {
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef,
  MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { DatePipe } from '@angular/common';
import {
  ViewChild, Component, OnInit, OnDestroy
} from '@angular/core';
import {
  fromEvent, Subject, Subscription, timer
} from 'rxjs';
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
import { startWith, takeUntil } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { ADMIN_USER_LIST_POLL_INTERVAL_MS } from '../../../../app.constants';
import { WorkspaceGroupToCheckCollection } from '../../models/workspace-group-to-check-collection.class';
import { IsSelectedIdPipe } from '../../../../pipes/is-selected-id.pipe';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { UsersMenuComponent } from '../users-menu/users-menu.component';
import { EntriesDividerComponent } from '../../../../components/entries-divider/entries-divider.component';
import {
  BackendService
} from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { HeartbeatService } from '../../../../services/heartbeat.service';

@Component({
  selector: 'studio-lite-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  // eslint-disable-next-line max-len
  imports: [UsersMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatTooltip, FormsModule, TranslateModule, IsSelectedIdPipe, MatFabButton, MatIconButton, MatIcon, EntriesDividerComponent, DatePipe]
})
export class UsersComponent implements OnInit, OnDestroy {
  objectsDatasource = new MatTableDataSource<UserFullDto>();
  displayedColumns = ['active', 'name', 'displayName', 'isAdmin', 'email', 'id', 'description', 'delete'];
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;
  userWorkspaceGroups = new WorkspaceGroupToCheckCollection([]);
  activeUserCount = 0;
  loggedInUserCount = 0;
  activeSessionCount = 0;
  passiveSessionCount = 0;
  private pollingSubscription: Subscription | null = null;
  private readonly ngUnsubscribe = new Subject<void>();

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private heartbeatService: HeartbeatService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private deleteConfirmDialog: MatDialog
  ) {
    this.tableSelectionRow.changed.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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

    if (typeof document !== 'undefined') {
      fromEvent(document, 'visibilitychange')
        .pipe(
          startWith(null),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(() => {
          if (UsersComponent.isTabVisible()) {
            this.startPolling();
          } else {
            this.stopPolling();
          }
        });
    } else {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    this.backendService.addUser(user).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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
    this.backendService.changeUserData(id, changedData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      if (result) {
        this.appService.dataLoading = true;
        const usersToDelete: number[] = [];
        users.forEach((r: UserFullDto) => usersToDelete.push(r.id));
        this.backendService.deleteUsers(usersToDelete).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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
      this.snackBar.open(
        this.translateService.instant('access-rights.not-saved'),
        this.translateService.instant('warning'),
        { duration: 3000 }
      );
    }
    if (this.selectedUser > 0) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspaceGroupsByAdmin(this.selectedUser).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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
        ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open(
                this.translateService.instant('access-rights.changed'),
                '',
                { duration: 1000 }
              );
              this.userWorkspaceGroups.setHasChangedFalse();
              this.userWorkspaceGroups.sortEntries();
            } else {
              this.snackBar.open(
                this.translateService.instant('access-rights.not-changed'),
                this.translateService.instant('error'),
                { duration: 3000 }
              );
            }
            this.appService.dataLoading = false;
          }
        );
      }
    }
  }

  updateUserList(showLoading = true, countAsActivity = showLoading): void {
    if (showLoading) {
      this.selectedUser = 0;
      this.appService.dataLoading = true;
    }
    if (countAsActivity && UsersComponent.isTabVisible()) {
      this.heartbeatService.refreshActivityPulse();
    }
    // Keep the admin route alive during periodic list polling by explicitly flagging user intent.
    const usersRequest = countAsActivity ? this.backendService.getUsersFullWithActivity() :
      this.backendService.getUsersFull();

    usersRequest.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (users: UserFullDto[]) => {
        this.setObjectsDatasource(users);
        if (showLoading) {
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        } else if (this.selectedUser) {
          const selected = users.find(u => u.id === this.selectedUser);
          if (selected) {
            this.tableSelectionRow.select(selected);
          } else {
            this.selectedUser = 0;
            this.tableSelectionRow.clear();
          }
        }
      }
    );
  }

  private startPolling(): void {
    if (this.pollingSubscription || !UsersComponent.isTabVisible()) {
      return;
    }

    this.pollingSubscription = timer(ADMIN_USER_LIST_POLL_INTERVAL_MS, ADMIN_USER_LIST_POLL_INTERVAL_MS)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.updateUserList(false, true);
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private static isTabVisible(): boolean {
    return typeof document !== 'undefined' && document.visibilityState === 'visible';
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

    this.activeUserCount = users.filter(u => u.activityStatus === 'active').length;
    this.loggedInUserCount = users.filter(u => u.isLoggedIn).length;
    this.activeSessionCount = users
      .flatMap(user => user.sessions || [])
      .filter(session => session.activityStatus === 'active').length;
    this.passiveSessionCount = users
      .flatMap(user => user.sessions || [])
      .filter(session => session.activityStatus === 'passive').length;
  }

  createWorkspaceList(): void {
    this.userWorkspaceGroups = new WorkspaceGroupToCheckCollection([]);
    this.backendService.getWorkspaceGroupList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(worksGroups => {
      this.userWorkspaceGroups = new WorkspaceGroupToCheckCollection(worksGroups);
      this.updateUserList();
    });
  }

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }
}
