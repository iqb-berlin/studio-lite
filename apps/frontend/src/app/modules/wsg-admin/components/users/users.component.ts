import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  UserFullDto, UserInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceToCheckCollection } from '../../models/workspace-to-check-collection.class';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'studio-lite-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    standalone: true,
    imports: [NgIf, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButton, MatTooltip, WrappedIconComponent, NgFor, MatCheckbox, FormsModule, IsSelectedIdPipe, TranslateModule]
})
export class UsersComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UserFullDto>([]);
  displayedColumns = ['name', 'displayName', 'email', 'description'];
  tableSelectionCheckbox = new SelectionModel <UserFullDto>(true, []);
  tableSelectionRow = new SelectionModel <UserFullDto>(false, []);
  selectedUser = 0;
  userWorkspaces = new WorkspaceToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private wsgAdminService: WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.tableSelectionRow.changed
      .subscribe(
        r => {
          if (r.added.length) {
            this.selectedUser = r.added[0].id;
          } else {
            this.selectedUser = 0;
          }
          this.updateWorkspaceList();
        }
      );
  }

  ngOnInit(): void {
    this.createWorkspaceList();
  }

  updateWorkspaceList(): void {
    if (this.userWorkspaces.hasChanged) {
      this.snackBar.open(
        this.translateService.instant('access-rights.not-saved'),
        this.translateService.instant('warning'),
        { duration: 3000 });
    }
    if (this.selectedUser) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspacesByUser(this.selectedUser)
        .subscribe(
          (dataResponse: WorkspaceInListDto[]) => {
            this.userWorkspaces.setChecks(dataResponse);
            this.appService.dataLoading = false;
          }
        );
    } else {
      this.userWorkspaces.setChecks();
    }
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

  saveWorkspaces(): void {
    if (this.selectedUser > 0) {
      if (this.userWorkspaces.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspacesByUser(
          this.selectedUser, this.userWorkspaces.getChecks(), this.wsgAdminService.selectedWorkspaceGroupId
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open(
                this.translateService.instant('access-rights.changed'),
                '',
                { duration: 1000 });
              this.userWorkspaces.setHasChangedFalse();
            } else {
              this.snackBar.open(
                this.translateService.instant('access-rights.not-changed'),
                this.translateService.instant('error'),
                { duration: 3000 });
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
    this.backendService.getUsersFull()
      .subscribe(
        (dataResponse: UserFullDto[]) => {
          if (dataResponse.length > 0) {
            this.setObjectsDatasource(dataResponse);
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
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId)
      .subscribe(workspaces => {
        this.userWorkspaces = new WorkspaceToCheckCollection(workspaces);
        this.updateUserList();
      });
  }

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }
}
