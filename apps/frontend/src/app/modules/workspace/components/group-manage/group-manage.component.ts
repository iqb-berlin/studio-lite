import {
  Component, OnInit, ViewChild
} from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';

import {
  MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { AppService } from '../../../../services/app.service';
import { Group } from '../../models/group.interface';
import { SaveChangesComponent } from '../save-changes/save-changes.component';
import { GroupMenuComponent } from '../group-menu/group-menu.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'studio-lite-group-manage',
  templateUrl: './group-manage.component.html',
  styleUrls: ['./group-manage.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatBadge, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, GroupMenuComponent, SelectUnitListComponent, SaveChangesComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class GroupManageComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  @ViewChild(MatSort) sort = new MatSort();
  changed = false;
  selectedGroup = '';
  units: UnitInListDto[] = [];
  groups: Group[] = [];
  groupUnitsOriginal: number[] = [];
  groupUnitsToChange: number[] = [];

  objectsDatasource = new MatTableDataSource<Group>();
  displayedColumns = ['name'];

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadGroups();
    });
  }

  selectGroup(name: string) {
    this.selectedGroup = name;
    if (this.selectedGroup) {
      this.groupUnitsOriginal = this.units.filter(u => u.groupName === name).map(u => u.id);
      this.groupUnitsToChange = this.groupUnitsOriginal;
      this.changed = false;
      if (this.unitSelectionTable) this.unitSelectionTable.selectedUnitIds = this.groupUnitsToChange;
    } else {
      this.groupUnitsToChange = [];
      this.groupUnitsOriginal = [];
      this.changed = false;
      if (this.unitSelectionTable) this.unitSelectionTable.selectedUnitIds = [];
    }
  }

  private loadGroups(selectGroup = '') {
    this.appService.dataLoading = true;
    combineLatest([
      this.backendService.getUnitList(this.workspaceService.selectedWorkspaceId),
      this.backendService.getUnitGroups(this.workspaceService.selectedWorkspaceId)
    ]).subscribe(result => {
      const units = result[0];
      const settingGroups = result[1];
      this.units = units;
      const groups:{ [key: string]: number } = {};
      this.units.forEach(u => {
        if (u.groupName) {
          if (groups[u.groupName]) {
            groups[u.groupName] += 1;
          } else {
            groups[u.groupName] = 1;
          }
        }
      });
      settingGroups.forEach(g => {
        if (!groups[g]) groups[g] = 0;
      });
      this.groups = Object.keys(groups).map(key => ({ name: key, count: groups[key] }));
      this.groupUnitsOriginal = [];
      this.groupUnitsToChange = [];
      this.appService.dataLoading = false;
      this.changed = false;
      this.selectGroup(selectGroup);
      // be sure that mat sort is initialized
      setTimeout(() => this.setObjectsDatasource(this.groups));
    });
  }

  private setObjectsDatasource(groups: Group[]): void {
    this.objectsDatasource = new MatTableDataSource(groups);
    this.objectsDatasource
      .filterPredicate = (group: Group, filter) => ['name']
        .some(column => (group[column as keyof Group] as string || '')
          .toLowerCase()
          .includes(filter));
    this.objectsDatasource.sort = this.sort;
  }

  unitSelectionChanged(): void {
    if (this.groupUnitsToChange && this.unitSelectionTable) {
      this.groupUnitsToChange = this.unitSelectionTable.selectedUnitIds;
      this.changed = this.detectChanges();
    }
  }

  discardChanges() {
    this.changed = false;
    this.groupUnitsToChange = this.groupUnitsOriginal ? this.groupUnitsOriginal : [];
    if (this.groupUnitsToChange && this.unitSelectionTable) {
      this.unitSelectionTable.selectedUnitIds = this.groupUnitsToChange ? this.groupUnitsToChange : [];
    }
  }

  saveChanged() {
    if (this.groupUnitsToChange) {
      this.backendService.setGroupUnits(
        this.workspaceService.selectedWorkspaceId,
        this.selectedGroup,
        this.groupUnitsToChange
      ).subscribe(ok => {
        if (ok) {
          this.snackBar.open(
            'Gruppe gespeichert', '', { duration: 1000 }
          );
          this.loadGroups(this.selectedGroup);
        } else {
          this.snackBar.open(
            'Konnte Gruppe nicht speichern', 'Fehler', { duration: 3000 }
          );
        }
      });
    }
  }

  detectChanges(): boolean {
    return this.groupUnitsOriginal.reduce((a, b) => a + b, 0) !==
      this.groupUnitsToChange.reduce((a, b) => a + b, 0);
  }

  addGroup(group: string) {
    this.appService.dataLoading = true;
    this.backendService.addUnitGroup(
      this.workspaceService.selectedWorkspaceId,
      group
    ).subscribe(isOK => {
      this.appService.dataLoading = false;
      if (isOK) {
        this.loadGroups(group);
      } else {
        this.snackBar.open('Konnte neue Gruppe nicht anlegen.', '', { duration: 3000 });
      }
    });
  }

  renameGroup(group: string) {
    this.appService.dataLoading = true;
    this.backendService.renameUnitGroup(
      this.workspaceService.selectedWorkspaceId,
      this.selectedGroup,
      group
    ).subscribe(isOK => {
      this.appService.dataLoading = false;
      if (isOK) {
        this.loadGroups(group);
      } else {
        this.snackBar.open('Konnte Gruppe nicht umbenennen.', '', { duration: 3000 });
      }
    });
  }

  deleteGroup() {
    this.appService.dataLoading = true;
    this.backendService.deleteUnitGroup(
      this.workspaceService.selectedWorkspaceId,
      this.selectedGroup
    ).subscribe(ok => {
      this.selectedGroup = '';
      this.appService.dataLoading = false;
      if (ok) {
        this.loadGroups();
      } else {
        this.snackBar.open(
          'Konnte Gruppe nicht löschen', 'Fehler', { duration: 3000 }
        );
      }
    });
  }
}
