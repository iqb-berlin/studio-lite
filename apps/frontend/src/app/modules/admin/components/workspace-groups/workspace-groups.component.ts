import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { FormsModule, UntypedFormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CreateWorkspaceGroupDto,
  UnitInViewDto,
  UserInListDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { UserToCheckCollection } from '../../models/users-to-check-collection.class';
import { State } from '../../models/state.type';
import { IsSelectedIdPipe } from '../../../shared/pipes/isSelectedId.pipe';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { WorkspaceGroupsMenuComponent } from '../workspace-groups-menu/workspace-groups-menu.component';
import { Profile } from '../../../shared/models/profile.type';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'studio-lite-workspace-groups',
  templateUrl: './workspace-groups.component.html',
  styleUrls: ['./workspace-groups.component.scss'],
  // eslint-disable-next-line max-len
  imports: [WorkspaceGroupsMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatTooltip, FormsModule, TranslateModule, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe, IsSelectedIdPipe, MatFabButton, MatIcon]
})
export class WorkspaceGroupsComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceGroupInListDto>();
  displayedColumns = ['selectCheckbox', 'name', 'id'];
  tableSelectionCheckboxes = new SelectionModel<WorkspaceGroupInListDto>(true, []);
  tableSelectionRow = new SelectionModel<WorkspaceGroupInListDto>(false, []);
  selectedWorkspaceGroupId = 0;
  workspaceUsers = new UserToCheckCollection([]);

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private i18nService: I18nService
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
      this.appService.appConfig.setPageTitle(`Admin: ${this.translateService.instant('wsg-admin.workspaces')}`);
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
        defaultEditor: '',
        profiles: []
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

  editGroupSettings(res: { states: State[], profiles: Profile[], selectedRow: number }): void {
    this.appService.dataLoading = true;
    this.backendService.setWorkspaceGroupProfiles({
      defaultEditor: '', defaultPlayer: '', defaultSchemer: '', states: res.states, profiles: res.profiles
    }, res.selectedRow)
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
      this.backendService.getWorkspaceGroupAdmins(this.selectedWorkspaceGroupId)
        .subscribe(
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
              this.workspaceUsers.sortEntries();
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
    this.backendService.getWorkspaceGroupList().subscribe(groups => {
      this.setObjectsDatasource(groups);
      this.tableSelectionCheckboxes.clear();
      this.tableSelectionRow.clear();
      this.appService.dataLoading = false;
    });
  }

  private setObjectsDatasource(groups: WorkspaceGroupInListDto[]): void {
    this.objectsDatasource = new MatTableDataSource(groups);
    this.objectsDatasource
      .filterPredicate = (groupList: WorkspaceGroupInListDto, filter) => [
        'name', 'id'
      ].some(column => (groupList[column as keyof WorkspaceGroupInListDto] || '')
        .toString()
        .toLowerCase()
        .includes(filter));
    this.objectsDatasource.sort = this.sort;
  }

  createUserList(): void {
    this.workspaceUsers = new UserToCheckCollection([]);
    this.backendService.getUsers().subscribe(users => {
      this.workspaceUsers = new UserToCheckCollection(users);
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

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }

  private static cleanUnitsData(units: UnitInViewDto[]): UnitInViewDto[] {
    return units.map(unit => ({
      key: unit.key,
      name: unit.name,
      groupName: unit.groupName,
      id: unit.id,
      workspaceName: unit.workspaceName,
      workspaceId: unit.workspaceId,
      lastChangedDefinition: unit.lastChangedDefinition,
      lastChangedMetadata: unit.lastChangedMetadata,
      lastChangedScheme: unit.lastChangedScheme,
      lastChangedDefinitionUser: unit.lastChangedDefinitionUser,
      lastChangedMetadataUser: unit.lastChangedMetadataUser,
      lastChangedSchemeUser: unit.lastChangedSchemeUser
    }));
  }

  private static toCSV(units: UnitInViewDto[]): string {
    const replacer = (key: string, value: unknown) => (value === null ? '' : value);
    const header = Object.keys(units[0]);
    return [
      header.join(','), // header row first
      ...units.map(row => header
        .map(fieldName => JSON.stringify(row[fieldName as keyof UnitInViewDto], replacer))
        .join(','))
    ].join('\r\n');
  }

  private saveFile(csv: string): void {
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
    saveAs(blob, `${thisDate} Units.csv`);
  }

  downloadUnits(): void {
    this.appService.dataLoading = true;
    try {
      this.backendService.getUnits()
        .subscribe(units => {
          const items = WorkspaceGroupsComponent.cleanUnitsData(units);
          const csv = WorkspaceGroupsComponent.toCSV(items);
          this.saveFile(csv);
          this.appService.dataLoading = false;
        });
    } catch (e) {
      this.appService.dataLoading = false;
    }
  }

  xlsxDownloadWorkspaceReport(): void {
    this.appService.dataLoading = true;
    try {
      this.backendService.getXlsWorkspaces().subscribe(b => {
        const datePipe = new DatePipe(this.i18nService.fullLocale);
        const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
        saveAs(b, `${thisDate} ${this.translateService.instant('wsg-admin.report-workspaces')}.xlsx`);
        this.appService.dataLoading = false;
      });
    } catch (e) {
      this.appService.dataLoading = false;
    }
  }
}
