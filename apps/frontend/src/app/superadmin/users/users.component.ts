import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite/iqb-components";
import {
  BackendService, GetUserDataResponse, IdLabelSelectedData, WorkspaceData
} from '../backend.service';
import { NewuserComponent } from './newuser/newuser.component';
import { NewpasswordComponent } from './newpassword/newpassword.component';
import { MainDatastoreService } from '../../maindatastore.service';
import { SuperadminPasswordRequestComponent } from
  '../superadmin-password-request/superadmin-password-request.component';

@Component({
  templateUrl: './users.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class UsersComponent implements OnInit {
  dataLoading = false;
  objectsDatasource = new MatTableDataSource<GetUserDataResponse>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableselectionCheckbox = new SelectionModel <GetUserDataResponse>(true, []);
  tableselectionRow = new SelectionModel <GetUserDataResponse>(false, []);
  selectedUser = '';

  pendingWorkspaceChanges = false;
  WorkspacelistDatasource = new MatTableDataSource<WorkspaceData>();
  displayedWorkspaceColumns = ['selectCheckbox', 'group', 'label'];

  @ViewChild(MatSort, { static: true }) sort = new MatSort();

  constructor(
    private mds: MainDatastoreService,
    private bs: BackendService,
    private newuserDialog: MatDialog,
    private newpasswordDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private confirmDialog: MatDialog,
    private superadminPasswordDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableselectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedUser = r.added[0].name;
        } else {
          this.selectedUser = '';
        }

        this.updateWorkspaceList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateObjectList();
      this.mds.pageTitle = 'Admin: Nutzer';
    });
  }

  // ***********************************************************************************
  addObject(): void {
    const dialogRef = this.newuserDialog.open(NewuserComponent, {
      width: '600px',
      data: {
        name: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.bs.addUser(
            (<FormGroup>result).get('name')?.value,
            (<FormGroup>result).get('pw')?.value
          ).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Nutzer hinzugefügt', '', { duration: 1000 });
                this.updateObjectList();
              } else {
                this.snackBar.open('Konnte Nutzer nicht hinzufügen', 'Fehler', { duration: 3000 });
              }
            },
            err => {
              this.snackBar.open(`Konnte Nutzer nicht hinzufügen (${err.code})`, 'Fehler', { duration: 3000 });
            }
          );
        }
      }
    });
  }

  changePassword(): void {
    let selectedRows = this.tableselectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Kennwort ändern',
          content: 'Bitte markieren Sie erst einen Nutzer!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.newpasswordDialog.open(NewpasswordComponent, {
        width: '600px',
        data: {
          name: selectedRows[0].name
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.dataLoading = true;
            this.bs.changePassword(
              selectedRows[0].name,
              (<FormGroup>result).get('pw')?.value
            ).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Kennwort geändert', '', { duration: 1000 });
                } else {
                  this.snackBar.open('Konnte Kennwort nicht ändern', 'Fehler', { duration: 3000 });
                }
                this.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Kennwort nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
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
          title: 'Löschen von Nutzern',
          content: 'Bitte markieren Sie erst Nutzer!',
          type: MessageType.error
        }
      });
    } else {
      let prompt = 'Soll';
      if (selectedRows.length > 1) {
        prompt = `${prompt}en ${selectedRows.length} Nutzer `;
      } else {
        prompt = `${prompt} Nutzer "${selectedRows[0].name}" `;
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Nutzern',
          content: `${prompt}gelöscht werden?`,
          confirmbuttonlabel: 'Nutzer löschen',
          showcancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          // =========================================================
          this.dataLoading = true;
          const usersToDelete: string[] = [];
          selectedRows.forEach((r: GetUserDataResponse) => usersToDelete.push(r.name));
          this.bs.deleteUsers(usersToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Nutzer gelöscht', '', { duration: 1000 });
                this.updateObjectList();
                this.dataLoading = false;
              } else {
                this.snackBar.open('Konnte Nutzer nicht löschen', 'Fehler', { duration: 3000 });
                this.dataLoading = false;
              }
            },
            err => {
              this.snackBar.open(`Konnte Nutzer nicht löschen (${err.code})`, 'Fehler', { duration: 3000 });
              this.dataLoading = false;
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateWorkspaceList(): void {
    this.pendingWorkspaceChanges = false;
    if (this.selectedUser.length > 0) {
      this.dataLoading = true;
      this.bs.getWorkspacesByUser(this.selectedUser).subscribe(
        (dataresponse: WorkspaceData[]) => {
          this.WorkspacelistDatasource = new MatTableDataSource(dataresponse);
          this.dataLoading = false;
        }, () => {
          // this.ass.updateAdminStatus('', '', [], err.label);
          this.dataLoading = false;
        }
      );
    } else {
      this.WorkspacelistDatasource = new MatTableDataSource();
    }
  }

  selectWorkspace(ws?: IdLabelSelectedData): void {
    if (ws) {
      ws.selected = !ws.selected;
    }
    this.pendingWorkspaceChanges = true;
  }

  saveWorkspaces(): void {
    this.pendingWorkspaceChanges = false;
    if (this.selectedUser.length > 0) {
      this.dataLoading = true;
      if (this.WorkspacelistDatasource) {
        this.bs.setWorkspacesByUser(this.selectedUser, this.WorkspacelistDatasource.data).subscribe(
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
      this.WorkspacelistDatasource = new MatTableDataSource();
    }
  }

  // ***********************************************************************************
  updateObjectList(): void {
    this.selectedUser = '';
    this.updateWorkspaceList();

    if (this.mds.loginStatus && this.mds.loginStatus.isSuperAdmin) {
      this.dataLoading = true;
      this.bs.getUsers().subscribe(
        (dataresponse: GetUserDataResponse[]) => {
          this.objectsDatasource = new MatTableDataSource(dataresponse);
          this.objectsDatasource.sort = this.sort;
          this.tableselectionCheckbox.clear();
          this.tableselectionRow.clear();
          this.dataLoading = false;
        }, () => {
          // this.ass.updateAdminStatus('', '', [], err.label);
          this.tableselectionCheckbox.clear();
          this.tableselectionRow.clear();
          this.dataLoading = false;
        }
      );
    }
  }

  changeSuperadminStatus(): void {
    let selectedRows = this.tableselectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Superadmin-Status ändern',
          content: 'Bitte markieren Sie erst einen Nutzer!',
          type: MessageType.error
        }
      });
    } else {
      const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Ändern des Superadmin-Status',
          content:
            `Für "${selectedRows[0].name}" den Status auf "
            ${selectedRows[0].is_superadmin ? 'NICHT ' : ''}Superadmin" setzen?`,
          confirmbuttonlabel: 'Status ändern',
          showcancel: true
        }
      });

      confirmDialogRef.afterClosed().subscribe(result => {
        if ((typeof result !== 'undefined') && (result !== false)) {
          const passwdDialogRef = this.superadminPasswordDialog.open(SuperadminPasswordRequestComponent, {
            width: '600px',
            data: `Superadmin-Status ${selectedRows[0].is_superadmin ? 'entziehen' : 'setzen'}`
          });

          passwdDialogRef.afterClosed().subscribe(afterClosedResult => {
            if (typeof afterClosedResult !== 'undefined') {
              if (afterClosedResult !== false) {
                this.bs.setSuperUserStatus(
                  selectedRows[0].id,
                  !selectedRows[0].is_superadmin,
                  (<FormGroup>afterClosedResult).get('pw')?.value
                ).subscribe(
                  respCode => {
                    if (respCode === true) {
                      this.snackBar.open('Status geändert', '', { duration: 1000 });
                      this.updateObjectList();
                    } else {
                      this.snackBar.open(
                        'Konnte Status nicht ändern (falsches Kennwort?)',
                        'Fehler',
                        { duration: 5000 }
                      );
                    }
                  },
                  err => {
                    this.snackBar.open(
                      `Konnte Status nicht ändern (Fehlercode ${err.code})`,
                      'Fehler',
                      { duration: 5000 }
                    );
                  }
                );
              }
            }
          });
        }
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

  selectRow(row: GetUserDataResponse): void {
    this.tableselectionRow.select(row);
  }
}
