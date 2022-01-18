import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {BackendService, IdLabelSelectedData, WorkspaceData, WorkspaceGroupData} from '../backend.service';
import { EditworkspaceComponent } from './editworkspace.component';
import { MainDatastoreService } from '../../maindatastore.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite/iqb-components";

@Component({
  templateUrl: './workspaces.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class WorkspacesComponent implements OnInit {
  dataLoading = false;
  objectsDatasource = new MatTableDataSource<WorkspaceData>();
  displayedColumns = ['selectCheckbox', 'group', 'name'];
  tableselectionCheckbox = new SelectionModel <WorkspaceData>(true, []);
  tableselectionRow = new SelectionModel <WorkspaceData>(false, []);
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  workspaceGroups: WorkspaceGroupData[] = [];

  pendingUserChanges = false;
  UserlistDatasource = new MatTableDataSource<IdLabelSelectedData>();
  displayedUserColumns = ['selectCheckbox', 'name'];

  @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;

  constructor(
    private mds: MainDatastoreService,
    private bs: BackendService,
    private editworkspaceDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableselectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedWorkspaceId = r.added[0].id;
          this.selectedWorkspaceName = r.added[0].label;
        } else {
          this.selectedWorkspaceId = 0;
          this.selectedWorkspaceName = '';
        }
        this.updateUserList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateObjectList();
      this.mds.pageTitle = 'Admin: Arbeitsbereiche';
    });
  }

  // ***********************************************************************************
  addObject(): void {
    if (this.workspaceGroups.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Arbeitsbereich hinzufügen',
          content: 'Bitte legen Sie erst eine Gruppe für Arbeitsbereiche an! Gehen Sie hierzu auf "Einstellungen"!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editworkspaceDialog.open(EditworkspaceComponent, {
        width: '600px',
        data: {
          name: '',
          title: 'Neuer Arbeitsbereich',
          saveButtonLabel: 'Anlegen',
          groups: this.workspaceGroups,
          group: this.workspaceGroups.length === 1 ? this.workspaceGroups[0].id : null
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.dataLoading = true;
            this.bs.addWorkspace(
              (<FormGroup>result).get('name')?.value,
              (<FormGroup>result).get('groupSelector')?.value
            ).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Arbeitsbereich hinzugefügt', '', { duration: 1000 });
                  this.updateObjectList();
                } else {
                  this.snackBar.open('Konnte Arbeitsbereich nicht hinzufügen', 'Fehler', { duration: 3000 });
                }
                this.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Arbeitsbereich nicht hinzufügen (
                ${err.code})`, 'Fehler', { duration: 3000 });
                this.dataLoading = false;
              }
            );
          }
        }
      });
    }
  }

  changeObject(): void {
    let selectedRows = this.tableselectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Arbeitsbereich ändern',
          content: 'Bitte markieren Sie erst einen Arbeitsbereich!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editworkspaceDialog.open(EditworkspaceComponent, {
        width: '600px',
        data: {
          name: selectedRows[0].label,
          title: 'Arbeitsbereich ändern',
          saveButtonLabel: 'Speichern',
          groups: this.workspaceGroups,
          group: selectedRows[0].ws_group_id
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.dataLoading = true;
            this.bs.changeWorkspace(
              selectedRows[0].id,
              (<FormGroup>result).get('name')?.value,
              (<FormGroup>result).get('groupSelector')?.value
            ).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Arbeitsbereich geändert', '', { duration: 1000 });
                  this.updateObjectList();
                } else {
                  this.snackBar.open('Konnte Arbeitsbereich nicht ändern', 'Fehler', { duration: 3000 });
                }
                this.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Arbeitsbereich nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
                this.dataLoading = false;
              }
            );
          }
        }
      });
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableselectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionRow.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Arbeitsbereichen',
          content: 'Bitte markieren Sie erst Arbeitsbereich/e!',
          type: MessageType.error
        }
      });
    } else {
      let prompt = 'Soll';
      if (selectedRows.length > 1) {
        prompt = `${prompt}en ${selectedRows.length} Arbeitsbereiche `;
      } else {
        prompt = `${prompt} Arbeitsbereich "${selectedRows[0].label}" `;
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Arbeitsbereichen',
          content: `${prompt}gelöscht werden?`,
          confirmbuttonlabel: 'Arbeitsbereich/e löschen',
          showcancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          // =========================================================
          this.dataLoading = true;
          const workspacesToDelete: number[] = [];
          selectedRows.forEach((r: WorkspaceData) => workspacesToDelete.push(r.id));
          this.bs.deleteWorkspaces(workspacesToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Arbeitsbereich/e gelöscht', '', { duration: 1000 });
                this.updateObjectList();
                this.dataLoading = false;
              } else {
                this.snackBar.open('Konnte Arbeitsbereich/e nicht löschen', 'Fehler', { duration: 1000 });
                this.dataLoading = false;
              }
            },
            err => {
              this.snackBar.open(`Konnte Arbeitsbereich/e nicht löschen (${err.code})`, 'Fehler', { duration: 3000 });
              this.dataLoading = false;
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateUserList(): void {
    this.pendingUserChanges = false;
    if (this.selectedWorkspaceId > 0) {
      this.dataLoading = true;
      this.bs.getUsersByWorkspace(this.selectedWorkspaceId).subscribe(
        (dataresponse: IdLabelSelectedData[]) => {
          this.UserlistDatasource = new MatTableDataSource(dataresponse);
          this.dataLoading = false;
        }, () => {
          // this.ass.updateAdminStatus('', '', [], err.label);
          this.dataLoading = false;
        }
      );
    } else {
      this.UserlistDatasource = new MatTableDataSource();
    }
  }

  selectUser(ws?: WorkspaceData): void {
    if (ws) {
      ws.selected = !ws.selected;
    }
    this.pendingUserChanges = true;
  }

  saveUsers(): void {
    this.pendingUserChanges = false;
    if (this.selectedWorkspaceId > 0) {
      this.dataLoading = true;
      if (this.UserlistDatasource) {
        this.bs.setUsersByWorkspace(this.selectedWorkspaceId, this.UserlistDatasource.data).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
            } else {
              this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
            }
            this.dataLoading = false;
          },
          err => {
            this.snackBar.open(`Konnte Zugriffsrechte nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
            this.dataLoading = false;
          }
        );
      }
    } else {
      this.UserlistDatasource = new MatTableDataSource();
    }
  }

  // ***********************************************************************************
  updateObjectList(): void {
    this.selectedWorkspaceId = 0;
    this.selectedWorkspaceName = '';
    this.updateUserList();

    if (this.mds.loginStatus && this.mds.loginStatus.isSuperAdmin) {
      this.dataLoading = true;
      this.bs.getWorkspaces().subscribe(
        (dataresponse: WorkspaceData[]) => {
          this.objectsDatasource = new MatTableDataSource(dataresponse);
          this.objectsDatasource.sort = this.sort;
          this.tableselectionCheckbox.clear();
          this.tableselectionRow.clear();
          this.dataLoading = false;
        }, () => {
          this.tableselectionCheckbox.clear();
          this.tableselectionRow.clear();
          this.dataLoading = false;
        }
      );
      this.bs.getWorkspaceGroupList().subscribe(wsg => {
        this.workspaceGroups = wsg;
      },
      () => {
        this.workspaceGroups = [];
      });
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.tableselectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableselectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableselectionCheckbox.select(row));
  }

  selectRow(row: WorkspaceData): void {
    this.tableselectionRow.select(row);
  }
}
