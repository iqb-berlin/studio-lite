import {
  Component, OnInit, Inject
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService, VeronaModuleData } from '../backend.service';
import { MainDatastoreService } from '../../maindatastore.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite/iqb-components";

@Component({
  templateUrl: './verona-modules.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class VeronaModulesComponent implements OnInit {
  dataLoading = false;
  editorData: VeronaModuleData[] = [];
  playerData: VeronaModuleData[] = [];
  selectedEditors: string[] = [];
  selectedPlayers: string[] = [];

  // for FileUpload
  uploadUrl = '';
  token: string | undefined;

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private mds: MainDatastoreService,
    private bs: BackendService,
    private newItemAuthoringToolDialog: MatDialog,
    private editItemAuthoringToolDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.uploadUrl = `${this.serverUrl}php_superadmin/uploadVeronaModule.php`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.pageTitle = 'Admin: Player/Editoren';
      this.updateFileList();
      const t = localStorage.getItem('t');
      this.token = t ? t : '';
    });
  }

  updateFileList(): void {
    this.dataLoading = true;
    this.editorData = [];
    this.playerData = [];
    this.selectedPlayers = [];
    this.selectedEditors = [];
    this.bs.getVeronaModuleList().subscribe(
      (fileData: VeronaModuleData[]) => {
        if (fileData) {
          fileData.forEach(fd => {
            if (fd.isEditor) {
              this.editorData.push(fd);
            } else if (fd.isPlayer) {
              this.playerData.push(fd);
            }
          });
        }
        this.dataLoading = false;
      }, () => {
        this.dataLoading = false;
      }
    );
  }

  deleteFiles(): void {
    const filesToDelete = this.selectedEditors.concat(this.selectedPlayers);
    if (filesToDelete.length > 0) {
      let prompt = 'Sie haben ';
      if (filesToDelete.length > 1) {
        prompt = `${prompt + filesToDelete.length} Dateien ausgewählt. Sollen`;
      } else {
        prompt += ' eine Datei ausgewählt. Soll';
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Dateien',
          content: `${prompt} diese gelöscht werden?`,
          confirmbuttonlabel: 'Löschen',
          showcancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          // =========================================================
          this.dataLoading = true;
          this.bs.deleteVeronaModules(filesToDelete).subscribe(
            (deletefilesresponse: string) => {
              this.snackBar.open(deletefilesresponse, '', { duration: 1000 });
              this.updateFileList();
            }, err => {
              this.snackBar.open(err.msg(), '', { duration: 3000 });
            }
          );
          // =========================================================
        }
      });
    } else {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Dateien',
          content: 'Bitte markieren Sie erst Dateien!',
          type: MessageType.error
        }
      });
    }
  }
}
