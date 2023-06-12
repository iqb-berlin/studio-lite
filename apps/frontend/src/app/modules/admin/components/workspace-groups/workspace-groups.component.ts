import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { UserInListDto, CreateWorkspaceGroupDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { UserToCheckCollection } from '../../../shared/models/users-to-check-collection.class';

const datePipe = new DatePipe('de-DE');

@Component({
  selector: 'studio-lite-workspace-groups',
  templateUrl: './workspace-groups.component.html',
  styleUrls: ['./workspace-groups.component.scss']
})
export class WorkspaceGroupsComponent implements OnInit {
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

  addGroup(result: UntypedFormGroup): void {
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

  editGroup(value: { selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }): void {
    this.appService.dataLoading = true;
    this.backendService.changeWorkspaceGroup({
      id: value.selection[0].id,
      name: value.group.get('name')?.value,
      settings: {
        defaultSchemer: '',
        defaultPlayer: '',
        defaultEditor: ''
      }
    })
      .subscribe(
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

  deleteGroups(groups: WorkspaceGroupInListDto[]): void {
    this.appService.dataLoading = true;
    const workspaceGroupsToDelete: number[] = [];
    groups.forEach(r => workspaceGroupsToDelete.push(r.id));
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

  private updateUserList(): void {
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

  private updateWorkspaceList(): void {
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
