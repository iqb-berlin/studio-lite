// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, Directive, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import {
  IqbFilesUploadInputForDirective, IqbFilesUploadQueueComponent, ConfirmDialogComponent
} from '@studio-lite-lib/iqb-components';
import { environment } from '../../../../../environments/environment';
import { VeronaModulesComponent } from './verona-modules.component';
import { AppService } from '../../../../services/app.service';
import { AppConfig } from '../../../../classes/app-config.class';
import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../services/backend.service';
import { VeronaModulesTableComponent } from '../verona-modules-table/verona-modules-table.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';

describe('VeronaModulesComponent', () => {
  let component: VeronaModulesComponent;
  let fixture: ComponentFixture<VeronaModulesComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;
  let mockModuleService: Partial<ModuleService>;
  let mockDialog: Partial<MatDialog>;
  let mockSnackBar: Partial<MatSnackBar>;

  @Component({ selector: 'iqb-files-upload-queue', template: '', standalone: true })
  class MockIqbFilesUploadQueueComponent {
    @Input() uploadQueue!: unknown;
    @Input() httpUrl: unknown;
    @Input() httpRequestHeaders: unknown;
    @Input() httpRequestParams: unknown;
    @Input() fileAlias: unknown;
    @Input() tokenName: unknown;
    @Input() token: unknown;
    @Input() folderName: unknown;
    @Input() folder: unknown;
  }

  @Component({ selector: 'studio-lite-verona-modules-table', template: '', standalone: true })
  class MockVeronaModulesTableComponent {
    @Input() uploadQueue!: unknown;
    @Input() modules: unknown;
    @Input() type: unknown;
  }

  @Directive({ selector: 'input[iqbFilesUploadInputFor], div[iqbFilesUploadInputFor]', standalone: true })
  class MockIqbFilesUploadInputForDirective {
    @Input() iqbFilesUploadInputFor!: unknown;
  }

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    mockBackendService = {
      deleteVeronaModules: jest.fn().mockReturnValue(of(true))
    };
    mockAppService = {
      dataLoading: false,
      appConfig: {
        setPageTitle: jest.fn()
      } as unknown as AppConfig
    };
    mockModuleService = {
      loadList: jest.fn().mockResolvedValue(undefined)
    };
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };
    mockSnackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatSnackBarModule,
        MatIconModule,
        MatDialogModule,
        VeronaModulesComponent,
        MockIqbFilesUploadQueueComponent,
        MockVeronaModulesTableComponent,
        MockIqbFilesUploadInputForDirective,
        MockWrappedIconComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: AppService, useValue: mockAppService },
        { provide: ModuleService, useValue: mockModuleService },
        { provide: BackendService, useValue: mockBackendService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
      .overrideComponent(VeronaModulesComponent, {
        remove: {
          imports: [
            IqbFilesUploadQueueComponent,
            VeronaModulesTableComponent,
            IqbFilesUploadInputForDirective,
            WrappedIconComponent
          ]
        },
        add: {
          imports: [
            MockIqbFilesUploadQueueComponent,
            MockVeronaModulesTableComponent,
            MockIqbFilesUploadInputForDirective,
            MockWrappedIconComponent
          ]
        }
      })
      .compileComponents();

    // Inject and mock TranslateService
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => key as string);

    fixture = TestBed.createComponent(VeronaModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load module list on init', async () => {
    jest.useFakeTimers();
    component.ngOnInit();
    jest.advanceTimersByTime(100);

    expect(mockModuleService.loadList).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should change selected modules correctly', () => {
    const module1 = { metadata: { type: 'editor' }, key: 'm1' } as VeronaModuleClass;
    const module2 = { metadata: { type: 'player' }, key: 'm2' } as VeronaModuleClass;
    const module3 = { metadata: { type: 'editor' }, key: 'm3' } as VeronaModuleClass;

    component.selectedModules = [module1, module2];

    component.changeSelectedModules({ type: 'editor', selectedModules: [module3] });

    expect(component.selectedModules).toHaveLength(2);
    expect(component.selectedModules).toContain(module2);
    expect(component.selectedModules).toContain(module3);
    expect(component.selectedModules).not.toContain(module1);
  });

  it('should delete modules successfully', () => {
    component.selectedModules = [{ key: 'm1' }] as VeronaModuleClass[];

    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(true))
    });

    component.deleteFiles();

    expect(mockBackendService.deleteVeronaModules).toHaveBeenCalledWith(['m1']);
    expect(mockSnackBar.open).toHaveBeenCalledWith(expect.stringMatching(/modules.deleted/), '', { duration: 1000 });
    expect(mockModuleService.loadList).toHaveBeenCalled();
  });

  it('should handle delete modules failure', () => {
    component.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    (mockBackendService.deleteVeronaModules as jest.Mock).mockReturnValue(of(false));

    component.deleteFiles();

    expect(mockSnackBar.open).toHaveBeenCalledWith('modules.not-deleted', 'error', { duration: 3000 });
  });

  it('should ask for confirmation before deleting', () => {
    component.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    const spy = jest.spyOn(mockDialog, 'open');
    component.deleteFiles();
    expect(spy).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
  });

  it('should abort delete if confirmation is rejected', () => {
    component.selectedModules = [{ key: 'm1' } as VeronaModuleClass];
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(false))
    });

    component.deleteFiles();

    expect(mockBackendService.deleteVeronaModules).not.toHaveBeenCalled();
  });
});
