import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { AppService } from '../../../services/app.service';
import { ModuleService } from '../../shared/services/module.service';
import { BackendService } from '../services/backend.service';
import { VeronaModuleClass } from '../../shared/models/verona-module.class';
import { ModulesDirective } from './modules.directive';

class TestModulesDirective extends ModulesDirective {
  loadModuleListSpy = jest.fn();
  protected readonly pageTitleKey = 'modules.title';
  protected readonly uploadPath = 'admin/verona-modules?type=editor&type=player&type=schemer';

  protected serverUrl: string;
  protected appService: AppService;
  moduleService: ModuleService;
  protected backendService: BackendService;
  protected deleteConfirmDialog: MatDialog;
  protected snackBar: MatSnackBar;
  protected translateService: TranslateService;

  constructor(
    serverUrl: string,
    appService: AppService,
    moduleService: ModuleService,
    backendService: BackendService,
    deleteConfirmDialog: MatDialog,
    snackBar: MatSnackBar,
    translateService: TranslateService
  ) {
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

  loadModuleList(): void {
    this.loadModuleListSpy();
  }
}

describe('ModulesDirective', () => {
  const createDirective = () => {
    const appService = {
      dataLoading: false,
      appConfig: {
        setPageTitle: jest.fn()
      }
    } as unknown as AppService;

    const moduleService = {} as ModuleService;

    const backendService = {
      deleteVeronaModules: jest.fn().mockReturnValue(of(true))
    } as unknown as jest.Mocked<BackendService>;

    const deleteConfirmDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    } as unknown as jest.Mocked<MatDialog>;

    const snackBar = {
      open: jest.fn()
    } as unknown as MatSnackBar;

    const translateService = {
      instant: jest.fn((key: string) => key)
    } as unknown as TranslateService;

    const directive = new TestModulesDirective(
      'https://server/',
      appService,
      moduleService,
      backendService,
      deleteConfirmDialog,
      snackBar,
      translateService
    );

    return {
      directive,
      appService,
      backendService,
      deleteConfirmDialog,
      snackBar,
      translateService
    };
  };

  it('computes upload url from server url and upload path', () => {
    const { directive } = createDirective();

    expect(directive.uploadUrl)
      .toBe('https://server/admin/verona-modules?type=editor&type=player&type=schemer');
  });

  it('sets page title, token, and loads module list on init', () => {
    const { directive, appService } = createDirective();
    jest.useFakeTimers();
    localStorage.setItem('t', 'token-123');

    directive.ngOnInit();
    jest.runAllTimers();

    expect(appService.appConfig.setPageTitle).toHaveBeenCalledWith('modules.title');
    expect(directive.loadModuleListSpy).toHaveBeenCalled();
    expect(directive.token).toBe('token-123');

    localStorage.removeItem('t');
    jest.useRealTimers();
  });

  it('changes selected modules by replacing the selected type', () => {
    const { directive } = createDirective();
    const module1 = { metadata: { type: 'editor' }, key: 'm1' } as VeronaModuleClass;
    const module2 = { metadata: { type: 'player' }, key: 'm2' } as VeronaModuleClass;
    const module3 = { metadata: { type: 'editor' }, key: 'm3' } as VeronaModuleClass;

    directive.selectedModules = [module1, module2];

    directive.changeSelectedModules({ type: 'editor', selectedModules: [module3] });

    expect(directive.selectedModules).toHaveLength(2);
    expect(directive.selectedModules).toContain(module2);
    expect(directive.selectedModules).toContain(module3);
    expect(directive.selectedModules).not.toContain(module1);
  });

  it('deletes modules after confirmation', () => {
    const {
      directive, backendService, deleteConfirmDialog, snackBar
    } = createDirective();
    directive.selectedModules = [{ key: 'm1' }] as VeronaModuleClass[];

    directive.deleteFiles();

    expect(deleteConfirmDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(backendService.deleteVeronaModules).toHaveBeenCalledWith(['m1']);
    expect(snackBar.open).toHaveBeenCalledWith(expect.stringMatching(/modules.deleted/), '', { duration: 1000 });
    expect(directive.loadModuleListSpy).toHaveBeenCalled();
  });

  it('shows error when delete fails', () => {
    const { directive, backendService, snackBar } = createDirective();
    directive.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    backendService.deleteVeronaModules.mockReturnValue(of(false));

    directive.deleteFiles();

    expect(snackBar.open).toHaveBeenCalledWith('modules.not-deleted', 'error', { duration: 3000 });
  });

  it('aborts delete when confirmation is rejected', () => {
    const { directive, backendService, deleteConfirmDialog } = createDirective();
    directive.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    deleteConfirmDialog.open.mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(false))
    } as unknown as ReturnType<MatDialog['open']>);

    directive.deleteFiles();

    expect(backendService.deleteVeronaModules).not.toHaveBeenCalled();
  });
});
