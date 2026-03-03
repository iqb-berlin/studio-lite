import {
  Component, Inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import {
  IqbFilesUploadInputForDirective, IqbFilesUploadQueueComponent
} from '@studio-lite-lib/iqb-components';
import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { VeronaModulesTableComponent } from '../verona-modules-table/verona-modules-table.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ModulesDirective } from '../../directives/modules.directive';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { ModuleSelectionChange } from '../../models/module-selection-change.interface';

@Component({
  selector: 'studio-lite-verona-modules',
  templateUrl: './verona-modules.component.html',
  styleUrls: ['./verona-modules.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadInputForDirective, IqbFilesUploadQueueComponent, VeronaModulesTableComponent, TranslateModule]
})
export class VeronaModulesComponent extends ModulesDirective {
  protected readonly pageTitleKey = 'modules.title';
  protected readonly uploadPath = 'admin/verona-modules?type=editor&type=player&type=schemer';

  protected serverUrl: string;
  protected appService: AppService;
  moduleService: ModuleService;
  protected backendService: BackendService;
  protected deleteConfirmDialog: MatDialog;
  protected snackBar: MatSnackBar;
  protected translateService: TranslateService;

  constructor(@Inject('SERVER_URL') serverUrl: string,
                                    appService: AppService,
                                    moduleService: ModuleService,
                                    backendService: BackendService,
                                    deleteConfirmDialog: MatDialog,
                                    snackBar: MatSnackBar,
                                    translateService: TranslateService) {
    super();
    this.serverUrl = serverUrl;
    this.appService = appService;
    this.moduleService = moduleService;
    this.backendService = backendService;
    this.deleteConfirmDialog = deleteConfirmDialog;
    this.snackBar = snackBar;
    this.translateService = translateService;
    this.setUpdateUploadUrl();
  }

  loadModuleList() {
    this.appService.dataLoading = true;
    this.moduleService.loadList().then(() => {
      this.appService.dataLoading = false;
    });
  }

  changeSelectedModules(selection: ModuleSelectionChange): void {
    const newSelection: VeronaModuleClass[] = [];

    this.selectedModules.forEach(module => {
      if (module.metadata?.type !== selection.type) {
        newSelection.push(module);
      }
    });
    selection.selectedModules.forEach(module => {
      newSelection.push(module);
    });

    this.selectedModules = newSelection;
  }
}
