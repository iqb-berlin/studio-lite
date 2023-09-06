import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CreateWorkspaceDto, UserInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { UserToCheckCollection } from '../../../shared/models/users-to-check-collection.class';
import { WorkspaceSettings } from '../../models/workspace-settings.interface';

const datePipe = new DatePipe('de-DE');

@Component({
  selector: 'studio-lite-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceInListDto>([]);
  displayedColumns = ['selectCheckbox', 'name', 'unitsCount'];
  tableSelectionCheckbox = new SelectionModel <WorkspaceInListDto>(true, []);
  tableSelectionRow = new SelectionModel <WorkspaceInListDto>(false, []);
  selectedWorkspaceId = 0;
  workspaceUsers = new UserToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
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
      }
    );
  }

  ngOnInit(): void {
    this.createUserList();
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
        (dataResponse: UserInListDto[]) => {
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
          this.workspaceUsers.getChecks()).subscribe(
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
        (dataResponse: WorkspaceInListDto[]) => {
          this.setObjectsDatasource(dataResponse);
          this.tableSelectionCheckbox.clear();
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
    this.workspaceUsers = new UserToCheckCollection([]);
    this.backendService.getUsers()
      .subscribe(users => {
        this.workspaceUsers = new UserToCheckCollection(users);
        this.updateWorkspaceList();
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

  toggleRowSelection(row: WorkspaceInListDto): void {
    this.tableSelectionRow.toggle(row);
  }

  xlsxDownloadWorkspaceReport() {
    this.backendService.getXlsWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId)
      .subscribe(workspace => {
        const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
        saveAs(
          workspace,
          this.translateService.instant('wsg-admin.workspaces-excel-name', { date: thisDate })
        );
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

  moveWorkspace(a:string) {
    this.appService.dataLoading = true;
    this.backendService.moveWorkspaces(2, [1]).subscribe(val => {
      this.appService.dataLoading = false;
      if (!val) {
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
