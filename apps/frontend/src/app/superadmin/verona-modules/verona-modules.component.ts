import {
  Component, OnInit, Inject
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../backend.service';
import { MainDatastoreService } from '../../maindatastore.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite-lib/iqb-components";
import {VeronaModulesTableComponent} from "./verona-modules-table.component";
import {VeronaModuleInListDto} from "@studio-lite-lib/api-dto";

@Component({
  templateUrl: './verona-modules.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class VeronaModulesComponent implements OnInit {
  dataLoading = false;
  selectedModules: VeronaModuleInListDto[] = [];
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
    this.uploadUrl = `${this.serverUrl}admin/verona-modules`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.pageTitle = 'Admin: Verona-Module';
      const t = localStorage.getItem('t');
      this.token = t ? t : '';
    });
  }

  updateTables() {
    const subTables: NodeListOf<Element> = document.querySelectorAll('app-verona-modules-table');
    if (subTables) {
      subTables.forEach((tab: unknown) => {
        (tab as VeronaModulesTableComponent).updateList()
      });
    }
  }

  changeSelectedModules(selection: {type: string; selectedModules: VeronaModuleInListDto[]}) {
    const newSelection: VeronaModuleInListDto[] = [];
    this.selectedModules.forEach(m => {
      if (m.metadata.type !== selection.type) {
        newSelection.push(m);
      }
    });
    selection.selectedModules.forEach(m => {
      newSelection.push(m)
    });
    this.selectedModules = newSelection;
  }

  deleteFiles(): void {
    if (this.selectedModules.length > 0) {
      let prompt = 'Sie haben ';
      if (this.selectedModules.length > 1) {
        prompt = `${prompt + this.selectedModules.length} Dateien ausgewählt. Sollen`;
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
          this.bs.deleteVeronaModules(this.selectedModules.map(element => element.key)).subscribe(
            (deletefilesresponse: string) => {
              this.snackBar.open(deletefilesresponse, '', { duration: 1000 });
              this.updateTables();
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
