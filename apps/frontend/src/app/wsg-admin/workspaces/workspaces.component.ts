import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from '@studio-lite-lib/iqb-components';
import {
  CreateWorkspaceDto, UserInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import { BackendService } from '../backend.service';
import { BackendService as AppBackendService } from '../../services/backend.service';
import { AppService } from '../../services/app.service';
import { UserToCheckCollection } from '../users/usersChecked';
import { WsgAdminService } from '../wsg-admin.service';
import { InputTextComponent } from '../../dialogs/input-text.component';
import {
  EditWorkspaceSettingsComponent
} from '../../dialogs/edit-workspace-settings/edit-workspace-settings.component';

const datePipe = new DatePipe('de-DE');

@Component({
  templateUrl: './workspaces.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class WorkspacesComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<WorkspaceInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
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
    private editWorkspaceDialog: MatDialog,
    private editWorkspaceSettingsDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
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
    setTimeout(() => {
      this.createUserList();
    });
  }

  // ***********************************************************************************
  addObject(): void {
    const dialogRef = this.editWorkspaceDialog.open(InputTextComponent, {
      width: '600px',
      data: {
        title: 'Neuer Arbeitsbereich',
        prompt: 'Bitte Namen eingeben',
        default: '',
        okButtonLabel: 'Anlegen'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.addWorkspace(<CreateWorkspaceDto>{
            name: result,
            groupId: this.wsgAdminService.selectedWorkspaceGroupId
          }).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Arbeitsbereich hinzugefügt', '', { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.snackBar.open('Konnte Arbeitsbereich nicht hinzufügen', 'Fehler', { duration: 3000 });
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
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: {
          title: 'Einstellungen ändern',
          content: 'Bitte markieren Sie erst einen Arbeitsbereich!',
          type: MessageType.error
        }
      });
    } else {
      this.appBackendService.getWorkspaceData(selectedRows[0].id).subscribe(
        wResponse => {
          if (wResponse) {
            const wsSettings = wResponse.settings || {
              defaultEditor: '',
              defaultPlayer: '',
              defaultSchemer: '',
              unitGroups: [],
              stableModulesOnly: true
            };
            const dialogRef = this.editWorkspaceSettingsDialog.open(EditWorkspaceSettingsComponent, {
              width: '600px',
              data: wsSettings
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result !== false) {
                this.appService.dataLoading = true;
                wsSettings.defaultEditor = result.defaultEditor;
                wsSettings.defaultPlayer = result.defaultPlayer;
                wsSettings.defaultSchemer = result.defaultSchemer;
                wsSettings.stableModulesOnly = result.stableModulesOnly;
                this.appBackendService.setWorkspaceSettings(selectedRows[0].id, wsSettings).subscribe(isOK => {
                  this.appService.dataLoading = false;
                  if (!isOK) {
                    this.snackBar.open('Einstellungen konnten nicht gespeichert werden.', '', { duration: 3000 });
                  } else {
                    this.snackBar.open('Einstellungen gespeichert', '', { duration: 1000 });
                  }
                });
              }
            });
          } else {
            this.snackBar.open(
              'Konnte Daten für Arbeitsbereich nicht laden', 'Fehler', { duration: 3000 }
            );
          }
        }
      );
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableSelectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionRow.selected;
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
          confirmButtonLabel: 'Arbeitsbereich/e löschen',
          showCancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // =========================================================
          this.appService.dataLoading = true;
          const workspacesToDelete: number[] = [];
          selectedRows.forEach((r: WorkspaceInListDto) => workspacesToDelete.push(r.id));
          this.backendService.deleteWorkspaces(
            this.wsgAdminService.selectedWorkspaceGroupId, workspacesToDelete
          ).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Arbeitsbereich/e gelöscht', '', { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.snackBar.open('Konnte Arbeitsbereich/e nicht löschen', 'Fehler', { duration: 1000 });
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
      this.snackBar.open('Zugriffsrechte nicht gespeichert.', 'Warnung', { duration: 3000 });
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
    this.backendService.getWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId).subscribe(
      (dataResponse: WorkspaceInListDto[]) => {
        this.objectsDatasource = new MatTableDataSource(dataResponse);
        this.objectsDatasource.sort = this.sort;
        this.tableSelectionCheckbox.clear();
        this.tableSelectionRow.clear();
        this.appService.dataLoading = false;
      }
    );
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

  selectRow(row: WorkspaceInListDto): void {
    this.tableSelectionRow.select(row);
  }

  renameObject() {
    let selectedRows = this.tableSelectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Arbeitsbereich umbenennen',
          content: 'Bitte markieren Sie erst einen Arbeitsbereich!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editWorkspaceDialog.open(InputTextComponent, {
        width: '600px',
        data: {
          title: 'Arbeitsbereich umbenennen',
          prompt: 'Bitte Namen eingeben',
          default: selectedRows[0].name,
          okButtonLabel: 'Speichern'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.appService.dataLoading = true;
            this.backendService.renameWorkspace(selectedRows[0].id, result).subscribe(
              respOk => {
                if (respOk) {
                  this.snackBar.open('Arbeitsbereich umbenannt', '', { duration: 1000 });
                  this.updateWorkspaceList();
                } else {
                  this.snackBar.open('Konnte Arbeitsbereich nicht umbenennen', 'Fehler', { duration: 3000 });
                }
                this.appService.dataLoading = false;
              }
            );
          }
        }
      });
    }
  }

  xlsxDownloadWorkspaceReport() {
    this.backendService.getXlsWorkspaces(this.wsgAdminService.selectedWorkspaceGroupId).subscribe(b => {
      const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      saveAs(b, `${thisDate} Bericht Arbeitsbereiche.xlsx`);
    });
  }
}
