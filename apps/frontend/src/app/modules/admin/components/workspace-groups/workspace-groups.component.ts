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
import {
  Component, OnDestroy, OnInit, ViewChild, computed, inject, signal
} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { FormsModule, UntypedFormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import {
  CreateWorkspaceGroupDto,
  UserInListDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { UserToCheckCollection } from '../../models/users-to-check-collection.class';
import { IsSelectedIdPipe } from '../../../../pipes/is-selected-id.pipe';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { WorkspaceGroupsMenuComponent } from '../workspace-groups-menu/workspace-groups-menu.component';
import { Profile } from '../../../../models/profile.type';
import { EntriesDividerComponent } from '../../../../components/entries-divider/entries-divider.component';
import { ChangeResultService } from '../../../../services/change-result.service';

/**
 * The workspace groups of the installation: creating, renaming and deleting them, appointing their
 * admins, and choosing the metadata profiles their workspaces may use.
 */
@Component({
  selector: 'studio-lite-workspace-groups',
  templateUrl: './workspace-groups.component.html',
  styleUrls: ['./workspace-groups.component.scss'],

  imports: [WorkspaceGroupsMenuComponent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatTooltip, FormsModule, TranslateModule, IsSelectedIdPipe, MatFabButton, MatIconButton, MatIcon, EntriesDividerComponent]
})
export class WorkspaceGroupsComponent implements OnInit, OnDestroy {
  objectsDatasource = new MatTableDataSource<WorkspaceGroupInListDto>();
  displayedColumns = ['id', 'name', 'delete'];
  tableSelectionRow = new SelectionModel<WorkspaceGroupInListDto>(false, []);
  selectedWorkspaceGroupId = 0;
  workspaceUsers = new UserToCheckCollection([]);
  private readonly loadingAdminsState = signal(false);
  // A check set before the admins of the selected group arrive would be reset by them (#2056).
  readonly loadingAdmins = this.loadingAdminsState.asReadonly();
  private readonly adminsNotLoadedState = signal(false);
  // Saving a check onto the empty list would replace the stored admins (#2070).
  readonly adminsNotLoaded = this.adminsNotLoadedState.asReadonly();
  readonly adminsLocked = computed(() => this.loadingAdmins() || this.adminsNotLoaded());
  private adminsRequest?: Subscription;
  private readonly ngUnsubscribe = new Subject<void>();

  @ViewChild(MatSort) sort = new MatSort();

  private changeResult = inject(ChangeResultService);

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private deleteConfirmDialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.tableSelectionRow.changed.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
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
    });
  }

  addGroup(result: UntypedFormGroup): void {
    this.appService.dataLoading = true;
    this.backendService.addWorkspaceGroup(<CreateWorkspaceGroupDto>{
      name: (<UntypedFormGroup>result).get('name')?.value,
      settings: {}
    }).subscribe(
      respOk => {
        this.changeResult.show(respOk, 'admin.group-created', 'admin.group-not-created');
        if (respOk) {
          this.updateWorkspaceList();
        }
        this.appService.dataLoading = false;
      }
    );
  }

  // Renaming sends the name alone: the API lays any settings sent over the stored ones, so empty
  // ones would wipe the group's profiles and default modules (#1960).
  editGroup(value: { selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }): void {
    this.appService.dataLoading = true;
    this.backendService.changeWorkspaceGroup({
      id: value.selection[0].id,
      name: value.group.get('name')?.value
    })
      .subscribe(
        respOk => {
          this.changeResult.show(respOk, 'admin.group-edited', 'admin.group-not-edited');
          if (respOk) {
            this.updateWorkspaceList();
          }
          this.appService.dataLoading = false;
        }
      );
  }

  editGroupSettings(res: { profiles: Profile[], selectedRow: number }): void {
    this.appService.dataLoading = true;
    this.backendService.setWorkspaceGroupProfiles(res.profiles, res.selectedRow)
      .subscribe(
        respOk => {
          this.changeResult.show(respOk, 'admin.group-edited', 'admin.group-not-edited');
          if (respOk) {
            this.updateWorkspaceList();
          }
          this.appService.dataLoading = false;
        }
      );
  }

  openDeleteDialog(group: WorkspaceGroupInListDto): void {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('admin.delete-groups-title'),
        content: this.translateService.instant('admin.delete-group', { name: group.name }),
        confirmButtonLabel: this.translateService.instant('delete'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteGroups([group]);
      }
    });
  }

  deleteGroups(groups: WorkspaceGroupInListDto[]): void {
    this.appService.dataLoading = true;
    const workspaceGroupsToDelete: number[] = [];
    groups.forEach(r => workspaceGroupsToDelete.push(r.id));
    this.backendService.deleteWorkspaceGroups(workspaceGroupsToDelete).subscribe(
      respOk => {
        this.changeResult.show(respOk, 'admin.groups-deleted', 'admin.groups-not-deleted');
        if (respOk) {
          this.updateWorkspaceList();
        }
        this.appService.dataLoading = false;
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
    // A late answer for the group selected before would overwrite the admins of this one.
    if (this.loadingAdmins()) {
      this.adminsRequest?.unsubscribe();
      this.loadingAdminsState.set(false);
      this.appService.dataLoading = false;
    }
    this.adminsNotLoadedState.set(false);
    if (this.selectedWorkspaceGroupId > 0) {
      this.appService.dataLoading = true;
      this.loadingAdminsState.set(true);
      this.adminsRequest = this.backendService.getWorkspaceGroupAdmins(this.selectedWorkspaceGroupId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (admins: UserInListDto[] | null) => {
            this.workspaceUsers.setChecks(admins ?? undefined);
            this.adminsNotLoadedState.set(!admins);
            this.loadingAdminsState.set(false);
            this.appService.dataLoading = false;
          }
        );
    } else {
      this.workspaceUsers.setChecks();
    }
  }

  saveUsers(): void {
    // The entries hold the checks of the group selected before, or of nobody.
    if (this.adminsLocked()) return;
    if (this.selectedWorkspaceGroupId > 0) {
      if (this.workspaceUsers.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setWorkspaceGroupAdmins(
          this.selectedWorkspaceGroupId, this.workspaceUsers.getChecks()
        ).subscribe(
          respOk => {
            this.changeResult.show(respOk, 'access-rights.changed', 'access-rights.not-changed');
            if (respOk) {
              this.workspaceUsers.setHasChangedFalse();
              this.workspaceUsers.sortEntries();
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

  toggleRowSelection(row: UserInListDto): void {
    this.tableSelectionRow.toggle(row);
  }

  ngOnDestroy(): void {
    // The cancelled answer cannot take the spinner down any more
    if (this.loadingAdmins()) this.appService.dataLoading = false;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
