import {
  Component, OnInit, Inject, ViewChildren, QueryList
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from '@studio-lite-lib/iqb-components';
import { ModuleService, VeronaModuleClass } from '@studio-lite/studio-components';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../backend.service';
import { AppService } from '../../../services/app.service';
import { VeronaModulesTableComponent } from './verona-modules-table.component';

@Component({
  templateUrl: './verona-modules.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class VeronaModulesComponent implements OnInit {
  @ViewChildren(VeronaModulesTableComponent) moduleTables!: QueryList<VeronaModulesTableComponent>;
  selectedModules: VeronaModuleClass[] = [];
  uploadUrl = '';
  token: string | undefined;

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private appService: AppService,
    public moduleService: ModuleService,
    private backendService: BackendService,
    private newItemAuthoringToolDialog: MatDialog,
    private editItemAuthoringToolDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.uploadUrl = `${this.serverUrl}admin/verona-modules`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig.setPageTitle('Admin: Verona-Module');
      const t = localStorage.getItem('t');
      this.loadModuleList();
      this.token = t || '';
    });
  }

  loadModuleList() {
    this.appService.dataLoading = true;
    this.moduleService.loadList().then(() => {
      this.appService.dataLoading = false;
    });
  }

  changeSelectedModules(selection: { type: string; selectedModules: VeronaModuleClass[] }) {
    const newSelection: VeronaModuleClass[] = [];
    this.selectedModules.forEach(m => {
      if (m.metadata.type !== selection.type) {
        newSelection.push(m);
      }
    });
    selection.selectedModules.forEach(m => {
      newSelection.push(m);
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
          confirmButtonLabel: 'Löschen',
          showCancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          // =========================================================
          this.appService.dataLoading = true;
          this.backendService.deleteVeronaModules(this.selectedModules.map(element => element.key)).subscribe(
            (deleteFilesOk: boolean) => {
              if (deleteFilesOk) {
                const message = this.translateService.instant('modules.delete', {
                  count: this.selectedModules.length
                });
                this.snackBar.open(message, '', { duration: 1000 });
                this.loadModuleList();
              } else {
                const message = this.translateService.instant('modules.delete-error');
                this.snackBar.open(message, '', { duration: 3000 });
                this.appService.dataLoading = false;
              }
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
