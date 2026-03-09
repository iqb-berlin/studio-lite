import {
  Directive,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { AppService } from '../../../services/app.service';
import { ModuleService } from '../../shared/services/module.service';
import { BackendService } from '../services/backend.service';
import { VeronaModulesTableComponent } from '../components/verona-modules-table/verona-modules-table.component';
import { VeronaModuleClass } from '../../../models/verona-module.class';
import { ModuleSelectionChange } from '../models/module-selection-change.interface';

@Directive()
export abstract class ModulesDirective implements OnInit {
  @ViewChildren(VeronaModulesTableComponent) moduleTables!: QueryList<VeronaModulesTableComponent>;
  selectedModules: VeronaModuleClass[] = [];
  uploadUrl = '';
  token: string | undefined;

  protected abstract readonly pageTitleKey: string;
  protected abstract readonly uploadPath: string;
  protected abstract serverUrl: string;
  protected abstract appService: AppService;
  abstract moduleService: ModuleService;
  protected abstract backendService: BackendService;
  protected abstract deleteConfirmDialog: MatDialog;
  protected abstract snackBar: MatSnackBar;
  protected abstract translateService: TranslateService;

  abstract loadModuleList(): void;
  abstract changeSelectedModules(selection: ModuleSelectionChange): void;

  protected setUpdateUploadUrl(): void {
    this.uploadUrl = `${this.serverUrl}${this.uploadPath}`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      const token = localStorage.getItem('t');
      this.loadModuleList();
      this.token = token || '';
    });
  }

  deleteFiles(): void {
    const content = (this.selectedModules.length > 1) ?
      this.translateService
        .instant('modules.delete-modules', { count: this.selectedModules.length }) :
      this.translateService
        .instant('modules.delete-module');
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('modules.delete-title'),
        content: content,
        confirmButtonLabel: this.translateService.instant('delete'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.appService.dataLoading = true;
        this.backendService.deleteVeronaModules(this.selectedModules.map(element => element.key)).subscribe(
          (deleteFilesOk: boolean) => {
            if (deleteFilesOk) {
              this.snackBar.open(
                this.translateService
                  .instant('modules.deleted', { count: this.selectedModules.length }),
                '',
                { duration: 1000 });
              this.loadModuleList();
            } else {
              this.snackBar.open(
                this.translateService.instant('modules.not-deleted'),
                this.translateService.instant('error'),
                { duration: 3000 });
              this.appService.dataLoading = false;
            }
          }
        );
      }
    });
  }
}
