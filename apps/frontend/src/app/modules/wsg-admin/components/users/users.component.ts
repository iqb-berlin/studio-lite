import {
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
  MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  UserFullDto, UserInListDto, UsersWorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceToCheckCollection } from '../../models/workspace-to-check-collection.class';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { WorkspaceChecked } from '../../models/workspace-checked.class';
import { RolesHeaderComponent } from '../roles-header/roles-header.component';

@Component({
  selector: 'studio-lite-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  // eslint-disable-next-line max-len
  imports: [SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader,
    MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButton, MatTooltip, WrappedIconComponent,
    MatCheckbox, FormsModule, IsSelectedIdPipe, TranslateModule, RolesHeaderComponent]
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

  changeAccessLevel(checked: boolean, workspace: WorkspaceChecked, level: number): void {
    if (checked) {
      workspace.accessLevel = level;
      workspace.isChecked = true;
    } else {
      workspace.accessLevel = 0;
      workspace.isChecked = false;
    }
    this.userWorkspaces.updateHasChanged();
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
          (dataResponse: UsersWorkspaceInListDto[]) => {
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
          this.selectedUser,
          this.userWorkspaces.getChecks(this.wsgAdminService.selectedWorkspaceGroupId.value)
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
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(workspaces => {
        this.userWorkspaces = new WorkspaceToCheckCollection(workspaces);
        this.updateUserList();
      });
  }

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }
}
