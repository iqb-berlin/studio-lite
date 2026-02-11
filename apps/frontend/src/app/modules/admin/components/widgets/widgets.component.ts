import {
  Component, Inject, OnInit, QueryList, ViewChildren
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  IqbFilesUploadInputForDirective,
  IqbFilesUploadQueueComponent
} from '@studio-lite-lib/iqb-components';
import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { VeronaModulesTableComponent } from '../verona-modules-table/verona-modules-table.component';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadInputForDirective, IqbFilesUploadQueueComponent, VeronaModulesTableComponent, TranslateModule]
})
export class WidgetsComponent implements OnInit {
  @ViewChildren(VeronaModulesTableComponent) moduleTables!: QueryList<VeronaModulesTableComponent>;
  selectedModules: VeronaModuleClass[] = [];
  uploadUrl = '';
  token: string | undefined;

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private appService: AppService,
    public moduleService: ModuleService,
    private backendService: BackendService,
    private deleteConfirmDialog: MatDialog,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
    this.uploadUrl = `${this.serverUrl}admin/verona-modules?type=widget`;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig
        .setPageTitle(this.translateService.instant('modules.widgets-title'));
      const token = localStorage.getItem('t');
      this.loadModuleList();
      this.token = token || '';
    });
  }

  loadModuleList() {
    this.appService.dataLoading = true;
    this.moduleService.loadWidgets().then(() => {
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
