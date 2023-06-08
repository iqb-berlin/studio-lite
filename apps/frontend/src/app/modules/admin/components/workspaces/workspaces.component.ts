import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { UserInListDto, CreateWorkspaceGroupDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { EditWorkspaceGroupComponent } from '../../workspace-groups/edit-workspace-group.component';
import { UserToCheckCollection } from '../../../shared/models/users-to-check-collection.class';

const datePipe = new DatePipe('de-DE');

@Component({
  selector: 'studio-lite-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceGroupInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <WorkspaceGroupInListDto>(true, []);
  tableSelectionRow = new SelectionModel <WorkspaceGroupInListDto>(false, []);
  selectedWorkspaceGroupId = 0;
  workspaceUsers = new UserToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private editWorkspaceDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private workspaceGroupsDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedWorkspaceGroupId = r.added[0].id;
        } else {
          this.selectedWorkspaceGroupId = 0;
        }
        this.updateUserList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createUserList();
      this.appService.appConfig.setPageTitle('Admin: Arbeitsbereiche');
    });
  }

  // ***********************************************************************************
  addObject(): void {
    const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
      width: '600px',
      data: {
        name: '',
        title: this.translateService.instant('admin.new-group'),
        saveButtonLabel: this.translateService.instant('create')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.addWorkspaceGroup(<CreateWorkspaceGroupDto>{
            name: (<UntypedFormGroup>result).get('name')?.value,
            settings: {}
          }).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open(
                  this.translateService.instant('admin.group-created'),
                  '',
                  { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.snackBar.open(
                  this.translateService.instant('admin.group-not-created'),
                  this.translateService.instant('error'),
                  { duration: 3000 });
              }
              this.appService.dataLoading = false;
            }
          );
        }
      }
    });
  }

  changeObject(): void {
    let selectedRows = this.tableSelectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionCheckbox.selected;
    }
    if (selectedRows.length) {
      const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
        width: '600px',
        data: {
          name: selectedRows[0].name,
          title: this.translateService.instant('admin.edit-group'),
          saveButtonLabel: this.translateService.instant('save')
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.appService.dataLoading = true;
            this.backendService.changeWorkspaceGroup({
              id: selectedRows[0].id,
              name: (<UntypedFormGroup>result).get('name')?.value,
              settings: {
                defaultSchemer: '',
                defaultPlayer: '',
                defaultEditor: ''
              }
            }).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open(
                    this.translateService.instant('admin.group-edited'),
                    '',
                    { duration: 1000 });
                  this.updateWorkspaceList();
                } else {
                  this.snackBar.open(
                    this.translateService.instant('admin.group-not-edited'),
                    this.translateService.instant('error'),
                    { duration: 3000 }
                  );
                }
                this.appService.dataLoading = false;
              }
            );
          }
        }
      });
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableSelectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionRow.selected;
    }
    if (selectedRows.length) {
      const content = (selectedRows.length === 1) ?
        this.translateService.instant('admin.delete-group', { name: selectedRows[0].name }) :
        this.translateService.instant('admin.delete-groups', { count: selectedRows.length });
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('admin.delete-groups-title'),
          content: content,
          confirmButtonLabel: this.translateService.instant('delete'),
          showCancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // =========================================================
          this.appService.dataLoading = true;
          const workspaceGroupsToDelete: number[] = [];
          selectedRows.forEach(r => workspaceGroupsToDelete.push(r.id));
          this.backendService.deleteWorkspaceGroups(workspaceGroupsToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open(
                  this.translateService.instant('admin.groups-deleted'),
                  '',
                  { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.snackBar.open(
                  this.translateService.instant('admin.groups-not-deleted'),
                  this.translateService.instant('error'),
                  { duration: 1000 });
                this.appService.dataLoading = false;
              }
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateUserList(): void {
    if (this.workspaceUsers.hasChanged) {
      this.snackBar.open(
        this.translateService.instant('access-rights.not-saved'),
        this.translateService.instant('warning'),
        { duration: 3000 });
    }
    if (this.selectedWorkspaceGroupId > 0) {
      this.appService.dataLoading = true;
      this.backendService.getWorkspaceGroupAdmins(this.selectedWorkspaceGroupId).subscribe(
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
    if (this.selectedWorkspaceGroupId > 0) {
      if (this.workspaceUsers.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspaceGroupAdmins(
          this.selectedWorkspaceGroupId, this.workspaceUsers.getChecks()
        ).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open(
                this.translateService.instant('access-rights.changed'),
                '',
                { duration: 1000 });
              this.workspaceUsers.setHasChangedFalse();
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

  // ***********************************************************************************
  updateWorkspaceList(): void {
    this.selectedWorkspaceGroupId = 0;
    this.updateUserList();

    this.appService.dataLoading = true;
    this.backendService.getWorkspaceGroupList().subscribe(dataresponse => {
      this.objectsDatasource = new MatTableDataSource(dataresponse);
      this.objectsDatasource.sort = this.sort;
      this.tableSelectionCheckbox.clear();
      this.tableSelectionRow.clear();
      this.appService.dataLoading = false;
    });
  }

  createUserList(): void {
    this.workspaceUsers = new UserToCheckCollection([]);
    this.backendService.getUsers().subscribe(users => {
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

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }

  xlsxDownloadWorkspaceReport() {
    this.backendService.getXlsWorkspaces().subscribe(b => {
      const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      saveAs(b, `${thisDate} Bericht Arbeitsbereiche.xlsx`);
    });
  }
}
