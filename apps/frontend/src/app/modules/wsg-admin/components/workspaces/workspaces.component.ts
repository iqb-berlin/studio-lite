import {
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef,
  MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CreateWorkspaceDto, WorkspaceInListDto, WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { BackendService } from '../../services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { BackendService as WorkspaceBackendService } from '../../../workspace/services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { WorkspaceSettings } from '../../models/workspace-settings.interface';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { WorkspaceMenuComponent } from '../workspace-menu/workspace-menu.component';
import { WorkspaceUserToCheckCollection } from '../../models/workspace-users-to-check-collection.class';
import { WorkspaceUserChecked } from '../../models/workspace-user-checked.class';
import { RolesHeaderComponent } from '../roles-header/roles-header.component';
import { WorkspaceNamePipe } from '../../pipes/workspace-name.pipe';

@Component({
  selector: 'studio-lite-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
  standalone: true,
  imports: [WorkspaceMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatButton, MatTooltip, WrappedIconComponent, FormsModule, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe,
    IsSelectedIdPipe, TranslateModule, MatIcon, MatIconButton, RolesHeaderComponent, WorkspaceNamePipe]
})
export class WorkspacesComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceInListDto>([]);
  workspaces: WorkspaceInListDto[] = [];
  displayedColumns = ['selectCheckbox', 'name', 'unitsCount', 'dropBoxId'];
  tableSelectionCheckboxes = new SelectionModel <WorkspaceInListDto>(true, []);
  tableSelectionRow = new SelectionModel <WorkspaceInListDto>(false, []);
  selectedWorkspaceId = 0;
  workspaceUsers = new WorkspaceUserToCheckCollection([]);
  isWorkspaceGroupAdmin = false;

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private workspaceBackendService: WorkspaceBackendService,
    private wsgAdminService: WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedWorkspaceId = r.added[0].id;
        } else {
          this.selectedWorkspaceId = 0;
        }
        this.updateUserList();
        this.isWorkspaceGroupAdmin = this.appService.isWorkspaceGroupAdmin(this.selectedWorkspaceId);
      }
    );
  }

  ngOnInit(): void {
    this.createUserList();
  }

  changeAccessLevel(checked: boolean, user: WorkspaceUserChecked, level: number): void {
    if (checked) {
      user.accessLevel = level;
      user.isChecked = true;
    } else {
      user.accessLevel = 0;
      user.isChecked = false;
    }
    this.workspaceUsers.updateHasChanged();
  }

  updateUserList(): void {
    if (this.workspaceUsers.hasChanged) {
      this.snackBar.open(
        this.translateService.instant('access-rights.not-saved'),
        this.translateService.instant('warning'),
        { duration: 3000 }
      );
    }
    if (this.selectedWorkspaceId > 0) {
      this.appService.dataLoading = true;
      this.backendService.getUsersByWorkspace(this.selectedWorkspaceId).subscribe(
        (dataResponse: WorkspaceUserInListDto[]) => {
          this.workspaceUsers.setChecks(dataResponse);
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.workspaceUsers.setChecks();
    }
  }

  saveUsers(): void {
    if (this.selectedWorkspaceId) {
      if (this.workspaceUsers.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setUsersByWorkspace(
          this.selectedWorkspaceId,
          this.workspaceUsers.getChecks()
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open(
                this.translateService.instant('access-rights.changed'),
                '',
                { duration: 1000 }
              );
              this.workspaceUsers.setHasChangedFalse();
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

  updateWorkspaceList(): void {
    this.selectedWorkspaceId = 0;
    this.updateUserList();
    this.appService.dataLoading = true;
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId)
      .subscribe(
        (workspaces: WorkspaceInListDto[]) => {
          this.workspaces = workspaces;
          this.setObjectsDatasource(workspaces);
          this.tableSelectionCheckboxes.clear();
          this.tableSelectionRow.clear();
          this.appService.dataLoading = false;
        }
      );
  }

  private setObjectsDatasource(workspaces: WorkspaceInListDto[]): void {
    this.objectsDatasource = new MatTableDataSource(workspaces);
    this.objectsDatasource
      .filterPredicate = (workspaceList: WorkspaceInListDto, filter) => ['name']
        .some(column => (workspaceList[column as keyof WorkspaceInListDto] as string || '')
          .toLowerCase()
          .includes(filter));
    this.objectsDatasource.sort = this.sort;
  }

  createUserList(): void {
    this.workspaceUsers = new WorkspaceUserToCheckCollection([]);
    this.backendService.getUsers()
      .subscribe(users => {
        this.workspaceUsers = new WorkspaceUserToCheckCollection(users);
        this.updateWorkspaceList();
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

  toggleRowSelection(row: WorkspaceInListDto): void {
    this.tableSelectionRow.toggle(row);
  }

  xlsxDownloadWorkspaceReport() {
    this.appService.dataLoading = true;
    this.backendService.getXlsWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId)
      .subscribe(workspace => {
        const datePipe = new DatePipe('de-DE');
        const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
        saveAs(
          workspace,
          this.translateService.instant('wsg-admin.workspaces-excel-name', { date: thisDate })
        );
        this.appService.dataLoading = false;
      });
  }

  deleteWorkspace(selectedRows: WorkspaceInListDto[]) {
    this.appService.dataLoading = true;
    const workspacesToDelete: number[] = [];
    selectedRows.forEach((r: WorkspaceInListDto) => workspacesToDelete.push(r.id));
    this.backendService.deleteWorkspaces(
      this.wsgAdminService.selectedWorkspaceGroupId, workspacesToDelete
    ).subscribe(
      respOk => {
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspaces-deleted'),
            '',
            { duration: 1000 }
          );
          this.updateWorkspaceList();
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspaces-not-deleted'),
            this.translateService.instant('error'),
            { duration: 1000 }
          );
          this.appService.dataLoading = false;
        }
      }
    );
  }

  moveWorkspace(value: { selection: WorkspaceInListDto[], workspaceGroupId: number }) {
    this.appService.dataLoading = true;
    const workspacesToMove: number[] = [];
    value.selection.forEach((workspace: WorkspaceInListDto) => {
      if (workspace.groupId !== value.workspaceGroupId) {
        this.workspaceBackendService.getUnitList(workspace.id).subscribe(async units => {
          // eslint-disable-next-line no-restricted-syntax
          for await (const unit of units) {
            this.workspaceBackendService.deleteUnitState(workspace.id, unit.id).subscribe(() => null);
          }
        });
      }
      workspacesToMove.push(workspace.id);
    });
    this.backendService.moveWorkspaces(value.workspaceGroupId, workspacesToMove).subscribe(
      respOk => {
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspaces-moved'),
            '',
            { duration: 1000 }
          );
          this.updateWorkspaceList();
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspaces-not-moved'),
            this.translateService.instant('error'),
            { duration: 1000 }
          );
          this.appService.dataLoading = false;
        }
      }
    );
  }

  addWorkspace(result: string) {
    this.appService.dataLoading = true;
    this.backendService.addWorkspace(<CreateWorkspaceDto>{
      name: result,
      groupId: this.wsgAdminService.selectedWorkspaceGroupId
    }).subscribe(
      respOk => {
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-added'),
            '',
            { duration: 1000 }
          );
          this.updateWorkspaceList();
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-not-added'),
            this.translateService.instant('error'),
            { duration: 3000 }
          );
        }
        this.appService.dataLoading = false;
      }
    );
  }

  selectDropBox(value: { selection: WorkspaceInListDto[], dropBoxId: number }) {
    this.appService.dataLoading = true;
    this.backendService.selectWorkspaceDropBox(value.selection[0].id, value.dropBoxId).subscribe(
      respOk => {
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.drop-box-selected'),
            '',
            { duration: 1000 }
          );
          this.updateWorkspaceList();
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.drop-box-not-selected'),
            this.translateService.instant('error'),
            { duration: 3000 }
          );
        }
        this.appService.dataLoading = false;
      }
    );
  }

  renameWorkspace(value: { selection: WorkspaceInListDto[], name: string }) {
    this.appService.dataLoading = true;
    this.backendService.renameWorkspace(value.selection[0].id, value.name).subscribe(
      respOk => {
        if (respOk) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-renamed'),
            '',
            { duration: 1000 }
          );
          this.updateWorkspaceList();
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-not-renamed'),
            this.translateService.instant('error'),
            { duration: 3000 }
          );
        }
        this.appService.dataLoading = false;
      }
    );
  }

  changeWorkspace(value: { selection: WorkspaceInListDto[], settings: WorkspaceSettings }) {
    this.appService.dataLoading = true;
    this.appBackendService.setWorkspaceSettings(value.selection[0].id, value.settings)
      .subscribe(isOK => {
        this.appService.dataLoading = false;
        if (!isOK) {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-settings-not-changed'),
            this.translateService.instant('error'),
            { duration: 3000 });
        } else {
          this.snackBar.open(
            this.translateService.instant('wsg-admin.workspace-settings-changed'),
            '',
            { duration: 1000 });
        }
      });
  }

  onWorkspaceNotLoaded(): void {
    this.snackBar.open(
      this.translateService.instant('wsg-admin.workspace-not-loaded'),
      this.translateService.instant('error'),
      { duration: 3000 }
    );
  }
}
