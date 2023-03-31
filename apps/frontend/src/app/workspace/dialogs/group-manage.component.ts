import {
  Component, OnInit, ViewChild
} from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { WorkspaceService } from '../services/workspace.service';
import { SelectUnitListComponent } from '../components/select-unit-list/select-unit-list.component';
import { AppService } from '../../app.service';
import { InputTextComponent } from '../../components/input-text.component';

@Component({
  templateUrl: './group-manage.component.html',
  styleUrls: ['./group-manage.component.scss']
})

export class GroupManageComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  changed = false;
  selectedGroup = '';
  units: UnitInListDto[] = [];
  groups: { [key: string]: number } = {};
  groupUnitsOriginal: number[] = [];
  groupUnitsToChange: number[] = [];

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private messageDialog: MatDialog,
    private inputTextDialog: MatDialog,
    private deleteConfirmDialog: MatDialog
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

  addGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: 'Neue Aufgabengruppe',
        default: '',
        okButtonLabel: 'Speichern',
        prompt: 'Name der Gruppe'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (result.length > 1) {
          this.appService.dataLoading = true;
          this.backendService.addUnitGroup(
            this.workspaceService.selectedWorkspaceId,
            result
          ).subscribe(isOK => {
            this.appService.dataLoading = false;
            if (isOK) {
              this.loadGroups(result);
            } else {
              this.snackBar.open('Konnte neue Gruppe nicht anlegen.', '', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  renameGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: 'Aufgabengruppe umbenennen',
        default: this.selectedGroup,
        okButtonLabel: 'Speichern',
        prompt: 'Name der Gruppe'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (result.length > 1) {
          this.appService.dataLoading = true;
          this.backendService.renameUnitGroup(
            this.workspaceService.selectedWorkspaceId,
            this.selectedGroup,
            result
          ).subscribe(isOK => {
            this.appService.dataLoading = false;
            if (isOK) {
              this.loadGroups(result);
            } else {
              this.snackBar.open('Konnte Gruppe nicht umbenennen.', '', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  deleteGroup() {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Aufgabengruppe löschen',
        content:
          `Die aktuell ausgewählte Gruppe '${
            this.selectedGroup
          }' wird gelöscht. Alle Aufgaben bleiben erhalten. Fortsetzen?`,
        confirmButtonLabel: 'Löschen',
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
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
    });
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
      this.groups = {};
      this.units.forEach(u => {
        if (u.groupName) {
          if (this.groups[u.groupName]) {
            this.groups[u.groupName] += 1;
          } else {
            this.groups[u.groupName] = 1;
          }
        }
      });
      settingGroups.forEach(g => {
        if (!this.groups[g]) this.groups[g] = 0;
      });
      this.groupUnitsOriginal = [];
      this.groupUnitsToChange = [];
      this.appService.dataLoading = false;
      this.changed = false;
      this.selectGroup(selectGroup);
    });
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
}
