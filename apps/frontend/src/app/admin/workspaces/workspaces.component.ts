import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {BackendService} from '../backend.service';
import { EditworkspaceComponent } from './editworkspace.component';
import { AppService } from '../../app.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite-lib/iqb-components";
import {WorkspaceGroupDto, CreateWorkspaceDto, UserInListDto, WorkspaceFullDto} from "@studio-lite-lib/api-dto";
import {UserToCheckCollection} from "../users/usersChecked";
import {WorkspaceGroupsComponent} from "./workspace-groups.component";
import {WorkspaceDataFlat} from "../../app.classes";
import {WorkspaceGroupData} from "./workspaceChecked";

@Component({
  templateUrl: './workspaces.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class WorkspacesComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceDataFlat>();
  displayedColumns = ['selectCheckbox', 'group', 'name'];
  tableselectionCheckbox = new SelectionModel <WorkspaceDataFlat>(true, []);
  tableselectionRow = new SelectionModel <WorkspaceDataFlat>(false, []);
  selectedWorkspaceId = 0;
  workspaceGroups: WorkspaceGroupData[] = [];

  workspaceUsers = new UserToCheckCollection([]);

  @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private editworkspaceDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private workspaceGroupsDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableselectionRow.changed.subscribe(
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
    setTimeout(() => {
      this.createUserList();
      this.appService.appConfig.setPageTitle('Admin: Arbeitsbereiche');
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
            this.appService.dataLoading = true;
            this.backendService.addWorkspace(<CreateWorkspaceDto>{
              name: (<FormGroup>result).get('name')?.value,
              groupId: (<FormGroup>result).get('groupSelector')?.value
            }).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Arbeitsbereich hinzugefügt', '', { duration: 1000 });
                  this.updateWorkspaceList();
                } else {
                  this.snackBar.open('Konnte Arbeitsbereich nicht hinzufügen', 'Fehler', { duration: 3000 });
                }
                this.appService.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Arbeitsbereich nicht hinzufügen (
                ${err.code})`, 'Fehler', { duration: 3000 });
                this.appService.dataLoading = false;
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
          name: selectedRows[0].name,
          title: 'Arbeitsbereich ändern',
          saveButtonLabel: 'Speichern',
          groups: this.workspaceGroups,
          group: selectedRows[0].groupId
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.appService.dataLoading = true;
            const workspaceData = <WorkspaceFullDto>{
              id: selectedRows[0].id,
            };
            const newName = (<FormGroup>result).get('name')?.value
            const newWorkspaceGroup = (<FormGroup>result).get('groupSelector')?.value
            if (newName !== selectedRows[0].name) workspaceData.name = newName;
            if (newWorkspaceGroup !== selectedRows[0].groupId) workspaceData.groupId = parseInt(newWorkspaceGroup);
            this.backendService.changeWorkspace(workspaceData).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Arbeitsbereich geändert', '', { duration: 1000 });
                  this.updateWorkspaceList();
                } else {
                  this.snackBar.open('Konnte Arbeitsbereich nicht ändern', 'Fehler', { duration: 3000 });
                }
                this.appService.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Arbeitsbereich nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
                this.appService.dataLoading = false;
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
        prompt = `${prompt} Arbeitsbereich "${selectedRows[0].name}" `;
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
        if (result === true) {
          // =========================================================
          this.appService.dataLoading = true;
          const workspacesToDelete: number[] = [];
          selectedRows.forEach((r: WorkspaceDataFlat) => workspacesToDelete.push(r.id));
          this.backendService.deleteWorkspaces(workspacesToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Arbeitsbereich/e gelöscht', '', { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.snackBar.open('Konnte Arbeitsbereich/e nicht löschen', 'Fehler', { duration: 1000 });
                this.appService.dataLoading = false;
              }
            },
            err => {
              this.snackBar.open(`Konnte Arbeitsbereich/e nicht löschen (${err.code})`, 'Fehler', { duration: 3000 });
              this.appService.dataLoading = false;
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateUserList(): void {
    if (this.workspaceUsers.hasChanged) {
      this.snackBar.open(`Zugriffsrechte nicht gespeichert.`, 'Warnung', { duration: 3000 });
    }
    if (this.selectedWorkspaceId > 0) {
      this.appService.dataLoading = true;
      this.backendService.getUsersByWorkspace(this.selectedWorkspaceId).subscribe(
        (dataresponse: UserInListDto[]) => {
          this.workspaceUsers.setChecks(dataresponse);
          this.appService.dataLoading = false;
        }, () => {
          // this.ass.updateAdminStatus('', '', [], err.label);
          this.appService.dataLoading = false;
        }
      );
    } else {
      this.workspaceUsers.setChecks();
    }
  }

  saveUsers(): void {
    if (this.selectedWorkspaceId > 0) {
      if (this.workspaceUsers.hasChanged) {
        this.appService.dataLoading = true;
        this.backendService.setUsersByWorkspace(this.selectedWorkspaceId, this.workspaceUsers.getChecks()).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
              this.workspaceUsers.setHasChangedFalse();
            } else {
              this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
            }
            this.appService.dataLoading = false;
          },
          err => {
            this.snackBar.open(`Konnte Zugriffsrechte nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
            this.appService.dataLoading = false;
          }
        );
      }
    }
  }

  // ***********************************************************************************
  updateWorkspaceList(): void {
    this.selectedWorkspaceId = 0;
    this.updateUserList();

    this.appService.dataLoading = true;
    this.backendService.getWorkspacesGroupwise().subscribe(
      (dataresponse: WorkspaceGroupDto[]) => {
        const workspaces: WorkspaceDataFlat[] = [];
        this.workspaceGroups = [];
        dataresponse.forEach(workspaceGroup => {
          this.workspaceGroups.push(<WorkspaceGroupData>{
            id: workspaceGroup.id,
            name: workspaceGroup.name,
            workspaceCount: workspaceGroup.workspaces.length
          });
          workspaceGroup.workspaces.forEach(workspace => {
            workspaces.push(<WorkspaceDataFlat>{
              id: workspace.id,
              groupName: workspaceGroup.name,
              name: workspace.name,
              groupId: workspaceGroup.id,
              selected: false
            })
          })
        });
        this.objectsDatasource = new MatTableDataSource(workspaces);
        this.objectsDatasource.sort = this.sort;
        this.tableselectionCheckbox.clear();
        this.tableselectionRow.clear();
        this.appService.dataLoading = false;
      }, () => {
        this.tableselectionCheckbox.clear();
        this.tableselectionRow.clear();
        this.appService.dataLoading = false;
      }
    );
  }

  createUserList(): void {
    this.workspaceUsers = new UserToCheckCollection([]);
    this.backendService.getUsers().subscribe(users => {
      this.workspaceUsers = new UserToCheckCollection(users);
      this.updateWorkspaceList()
    })
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

  selectRow(row: WorkspaceDataFlat): void {
    this.tableselectionRow.select(row);
  }

  editWorkspaceGroups() {
    const dialogRef = this.workspaceGroupsDialog.open(WorkspaceGroupsComponent, {
      width: '600px',
      minHeight: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updateWorkspaceList();
    });
  }
}
