import {
  Component, Inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import {
  IqbFilesUploadInputForDirective,
  IqbFilesUploadQueueComponent
} from '@studio-lite-lib/iqb-components';
import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { VeronaModulesTableComponent } from '../verona-modules-table/verona-modules-table.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ModulesDirective } from '../../directives/modules.directive';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { ModuleSelectionChange } from '../../models/module-selection-change';

@Component({
  selector: 'studio-lite-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadInputForDirective, IqbFilesUploadQueueComponent, VeronaModulesTableComponent, TranslateModule]
})
export class WidgetsComponent extends ModulesDirective {
  protected readonly pageTitleKey = 'modules.widgets-title';
  protected readonly uploadPath = 'admin/verona-modules?type=widget';

  protected serverUrl: string;
  protected appService: AppService;
  moduleService: ModuleService;
  protected backendService: BackendService;
  protected deleteConfirmDialog: MatDialog;
  protected snackBar: MatSnackBar;
  protected translateService: TranslateService;
  widgetGroups: { model: string; modules: { [key: string]: VeronaModuleClass } }[] = [];

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
    this.updateUploadUrl();
  }

  loadModuleList() {
    this.appService.dataLoading = true;
    this.moduleService.loadWidgets().then(() => {
      this.buildWidgetGroups();
      this.appService.dataLoading = false;
    });
  }

  changeSelectedModules(selection: ModuleSelectionChange): void {
    const newSelection: VeronaModuleClass[] = [];
    const selectionKey = selection.type || '';

    this.selectedModules.forEach(module => {
      const moduleKey = module.metadata?.model || '';
      if (moduleKey !== selectionKey) {
        newSelection.push(module);
      }
    });
    selection.selectedModules.forEach(module => {
      newSelection.push(module);
    });

    this.selectedModules = newSelection;
  }

  private buildWidgetGroups(): void {
    const groups = new Map<string, { [key: string]: VeronaModuleClass }>();
    Object.keys(this.moduleService.widgets || {}).forEach(key => {
      const module = this.moduleService.widgets[key];
      const model = module?.metadata?.model || '';
      if (!groups.has(model)) {
        groups.set(model, {});
      }
      groups.get(model)![key] = module;
    });

    this.widgetGroups = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([model, modules]) => ({ model, modules }));
  }
}
