import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { AppService } from '../../../services/app.service';
import { ModuleService } from '../../../services/module.service';
import { BackendService } from '../services/backend.service';
import { VeronaModuleClass } from '../../../models/verona-module.class';
import { ModulesDirective } from './modules.directive';

class TestModulesDirective extends ModulesDirective {
  loadModuleListSpy = jest.fn();
  protected readonly pageTitleKey = 'modules.title';
  protected readonly uploadPath = 'admin/verona-modules?type=editor&type=player&type=schemer';

  constructor(
    serverUrl: string,
    appService: AppService,
    moduleService: ModuleService,
    backendService: BackendService,
    deleteConfirmDialog: MatDialog,
    snackBar: MatSnackBar,
    translateService: TranslateService
  ) {
    super(serverUrl, appService, moduleService, backendService, deleteConfirmDialog, snackBar, translateService);
    this.setUpdateUploadUrl();
  }

  loadModuleList(): void {
    this.loadModuleListSpy();
  }

  // eslint-disable-next-line class-methods-use-this
  changeSelectedModules(): void {
    // Selection behavior is tested in derived components.
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

  it('sets token and loads module list on init', () => {
    const { directive } = createDirective();
    jest.useFakeTimers();
    localStorage.setItem('t', 'token-123');

    directive.ngOnInit();
    jest.runAllTimers();

    expect(directive.loadModuleListSpy).toHaveBeenCalled();
    expect(directive.token).toBe('token-123');

    localStorage.removeItem('t');
    jest.useRealTimers();
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

  // Esc, a click beside the dialog and navigation close it with undefined (#1844)
  it.each([false, undefined])('aborts delete when the dialog closes with %s', result => {
    const { directive, backendService, deleteConfirmDialog } = createDirective();
    directive.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    deleteConfirmDialog.open.mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(result))
    } as unknown as ReturnType<MatDialog['open']>);

    directive.deleteFiles();

    expect(backendService.deleteVeronaModules).not.toHaveBeenCalled();
  });

  it.each<[string, string[], string]>([
    ['one module', ['m1'], 'modules.delete-module'],
    ['several modules by their number', ['m1', 'm2'], 'modules.delete-modules']
  ])('asks before deleting %s', (_, keys, content) => {
    const { directive, deleteConfirmDialog } = createDirective();
    directive.selectedModules = keys.map(key => ({ key }) as VeronaModuleClass);

    directive.deleteFiles();

    expect(deleteConfirmDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.objectContaining({
      data: expect.objectContaining({ content })
    }));
  });
});
