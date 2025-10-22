import {
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef,
  MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import {
  ViewChild, Component, OnInit, OnDestroy
} from '@angular/core';
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
import { MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { WorkspaceSettings } from '../../models/workspace-settings.interface';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { WorkspaceMenuComponent } from '../workspace-menu/workspace-menu.component';
import { WorkspaceUserToCheckCollection } from '../../models/workspace-users-to-check-collection.class';
import { WorkspaceUserChecked } from '../../models/workspace-user-checked.class';
import { RolesHeaderComponent } from '../roles-header/roles-header.component';
import { WorkspaceNamePipe } from '../../pipes/workspace-name.pipe';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'studio-lite-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
  imports: [WorkspaceMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef,
    MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    MatTooltip, FormsModule, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe,
    IsSelectedIdPipe, TranslateModule, MatIcon, RolesHeaderComponent, WorkspaceNamePipe, MatFabButton]
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  objectsDatasource = new MatTableDataSource<WorkspaceInListDto>([]);
  workspaces: WorkspaceInListDto[] = [];
  displayedColumns = ['selectCheckbox', 'name', 'id', 'unitsCount', 'dropBoxId'];
  tableSelectionCheckboxes = new SelectionModel <WorkspaceInListDto>(true, []);
  tableSelectionRow = new SelectionModel <WorkspaceInListDto>(false, []);
  selectedWorkspaceId = 0;
  workspaceUsers = new WorkspaceUserToCheckCollection([]);
  isWorkspaceGroupAdmin = false;
  isBackUpWorkspaceGroup = false;
  maxWorkspaceCount = 10;
  unitsCount = 0;

  private ngUnsubscribe = new Subject<void>();
  private backUpFolderName = 'backup';

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private workspaceBackendService: WorkspaceBackendService,
    private wsgAdminService: WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private i18nService: I18nService
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
    this.wsgAdminService.selectedWorkspaceGroupName
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        name => {
          this.isBackUpWorkspaceGroup = name ? name
            .toLowerCase()
            .includes(this.backUpFolderName) : false;
        });
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
              this.workspaceUsers.sortEntries();
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
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(
        (workspaces: WorkspaceInListDto[]) => {
          this.workspaces = workspaces;
          this.unitsCount = this.getUnitsCount();
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
      .filterPredicate = (workspaceList: WorkspaceInListDto, filter) => ['name', 'id', 'unitsCount']
        .some(column => (workspaceList[column as keyof WorkspaceInListDto] || '')
          .toString()
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
    this.backendService.getXlsWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(workspace => {
        const datePipe = new DatePipe(this.i18nService.fullLocale);
        const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
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
    this.backendService.deleteWorkspaces(workspacesToDelete)
      .subscribe(
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
        });
  }

  moveWorkspace(value: { selection: WorkspaceInListDto[], workspaceGroupId: number }) {
    this.appService.dataLoading = true;
    const workspacesToMove: number[] = value.selection.map(workspace => workspace.id);
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
      groupId: this.wsgAdminService.selectedWorkspaceGroupId.value
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getUnitsCount(): number {
    return this.workspaces.reduce((acc, workspace) => acc + (workspace.unitsCount || 0), 0);
  }
}
