import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router, UrlCreationOptions, UrlTree } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Overlay } from '@angular/cdk/overlay';
import { environment } from '../../../../../environments/environment';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PreviewService } from '../../services/preview.service';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { UnitPreviewComponent } from './unit-preview.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import { PageData } from '../../models/page-data.interface';
import { Progress } from '../../models/types';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { WidgetCallData } from '../../models/widget-call-data.interface';

describe('UnitPreviewComponent', () => {
  let component: UnitPreviewComponent;
  let fixture: ComponentFixture<UnitPreviewComponent>;
  let snackBarStub: MatSnackBar;
  let dialogStub: MatDialog;
  let routerStub: Router;
  let workspaceServiceStub: WorkspaceService;
  let backendServiceStub: WorkspaceBackendService;
  let moduleServiceStub: ModuleService;

  @Component({ selector: 'studio-lite-preview-bar', template: '', standalone: true })
  class MockPreviewBarComponent {
    @Input() pageList!: PageData[];
    @Input() playerApiVersion!: number;
    @Input() postMessageTarget!: Window | undefined;
    @Input() playerName!: string;
    @Input() presentationProgress!: Progress;
    @Input() responseProgress!: Progress;
    @Input() hasFocus!: boolean;
  }

  beforeEach(async () => {
    snackBarStub = {
      open: jest.fn()
    } as unknown as MatSnackBar;

    dialogStub = {
      open: jest.fn()
    } as unknown as MatDialog;

    routerStub = {
      serializeUrl: jest.fn(),
      createUrlTree: jest.fn(),
      routerState: { snapshot: { url: '/a/1' } }
    } as unknown as Router;

    backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null)),
      getDirectDownloadLink: jest.fn().mockReturnValue('direct')
    } as unknown as WorkspaceBackendService;

    workspaceServiceStub = {
      selectedUnit$: new BehaviorSubject<number>(5),
      selectedWorkspaceId: 7,
      groupId: 9,
      unitDefinitionStoreChanged: new Subject<void>(),
      isChanged: jest.fn().mockReturnValue(false),
      getUnitDefinitionStore: () => undefined,
      getUnitMetadataStore: () => undefined
    } as unknown as WorkspaceService;

    const previewServiceStub = {
      pagingMode: new BehaviorSubject<string>('linear')
    } as unknown as PreviewService;

    moduleServiceStub = {
      widgets: {},
      loadWidgets: jest.fn().mockResolvedValue(undefined),
      getModuleHtml: jest.fn().mockResolvedValue('<html lang="">Widget</html>')
    } as unknown as ModuleService;

    const appServiceStub = { postMessage$: new Subject<MessageEvent>() } as unknown as AppService;

    await TestBed.configureTestingModule({
      imports: [
        UnitPreviewComponent,
        CommonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: MatSnackBar, useValue: snackBarStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: Router, useValue: routerStub },
        { provide: WorkspaceBackendService, useValue: backendServiceStub },
        { provide: WorkspaceService, useValue: workspaceServiceStub },
        { provide: PreviewService, useValue: previewServiceStub },
        { provide: ModuleService, useValue: moduleServiceStub },
        { provide: AppService, useValue: appServiceStub },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitPreviewComponent, {
        remove: { imports: [PreviewBarComponent] },
        add: { imports: [MockPreviewBarComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens a print view with computed query params', () => {
    const urlTree = {} as UrlTree;
    (routerStub.createUrlTree as jest.Mock).mockReturnValue(urlTree);
    (routerStub.serializeUrl as jest.Mock).mockReturnValue('/print?x=1');
    jest.spyOn(window, 'open').mockReturnValue(null);

    component.openPrintView([
      { key: 'printPreviewHeight', value: 400 },
      { key: 'metadata', value: true },
      { key: 'responses', value: false }
    ]);

    const args = (routerStub.createUrlTree as jest.Mock).mock.calls[0];
    const extras = args[1] as UrlCreationOptions;
    /* eslint-disable @typescript-eslint/dot-notation */
    expect(extras.queryParams?.['printPreviewHeight']).toBe(400);
    expect(extras.queryParams?.['printOptions']).toEqual(['metadata']);
    expect(extras.queryParams?.['unitIds']).toEqual([5]);
    expect(extras.queryParams?.['workspaceId']).toBe(7);
    expect(extras.queryParams?.['workspaceGroupId']).toBe(9);
    expect(window.open).toHaveBeenCalledWith('#/print?x=1', '_blank');
  });

  it('warns when coding is checked while changes exist', async () => {
    (workspaceServiceStub.isChanged as jest.Mock).mockReturnValue(true);

    await component.checkCodingChanged();

    expect(snackBarStub.open).toHaveBeenCalled();
    expect(backendServiceStub.getUnitScheme).not.toHaveBeenCalled();
  });

  it('loads coding scheme when no changes exist', async () => {
    (workspaceServiceStub.isChanged as jest.Mock).mockReturnValue(false);

    await component.checkCodingChanged();

    expect(backendServiceStub.getUnitScheme).toHaveBeenCalledWith(7, 5);
  });

  describe('handleWidgetCall', () => {
    it('loads widgets when none are cached', fakeAsync(() => {
      moduleServiceStub.widgets = {};

      const calcWidget = {
        key: 'calc@1.0',
        metadata: { model: 'calculator', type: 'widget' }
      } as unknown as VeronaModuleClass;

      (moduleServiceStub.loadWidgets as jest.Mock).mockImplementation(
        () => {
          moduleServiceStub.widgets = { 'calc@1.0': calcWidget };
          return Promise.resolve();
        }
      );

      const overlaySpy = jest.spyOn(
        TestBed.inject(Overlay), 'create'
      ).mockReturnValue({
        attach: jest.fn().mockReturnValue({
          instance: {
            widgetHtml: '',
            widgetCallData: undefined,
            playerPostMessageTarget: undefined,
            playerSessionId: '',
            overlayRef: undefined
          }
        }),
        dispose: jest.fn()
      } as unknown as ReturnType<Overlay['create']>);

      component.handleWidgetCall({
        callId: 'c1',
        widgetType: 'CALCULATOR',
        parameters: { k: 'v' },
        state: 's'
      });

      tick();

      expect(moduleServiceStub.loadWidgets).toHaveBeenCalled();
      expect(moduleServiceStub.getModuleHtml).toHaveBeenCalledWith(calcWidget);

      tick();

      expect(overlaySpy).toHaveBeenCalled();
    }));

    it('skips loadWidgets when widgets are already cached', fakeAsync(() => {
      const calcWidget = {
        key: 'calc@1.0',
        metadata: { model: 'calculator', type: 'widget' }
      } as unknown as VeronaModuleClass;
      moduleServiceStub.widgets = { 'calc@1.0': calcWidget };

      jest.spyOn(TestBed.inject(Overlay), 'create').mockReturnValue({
        attach: jest.fn().mockReturnValue({
          instance: {
            widgetHtml: '',
            widgetCallData: undefined,
            playerPostMessageTarget: undefined,
            playerSessionId: '',
            overlayRef: undefined
          }
        }),
        dispose: jest.fn()
      } as unknown as ReturnType<Overlay['create']>);

      component.handleWidgetCall({
        callId: 'c2',
        widgetType: 'CALCULATOR'
      });

      tick();

      expect(moduleServiceStub.loadWidgets).not.toHaveBeenCalled();
      expect(moduleServiceStub.getModuleHtml).toHaveBeenCalledWith(calcWidget);
    }));

    it('warns when no matching widget is found', fakeAsync(() => {
      moduleServiceStub.widgets = {};
      (moduleServiceStub.loadWidgets as jest.Mock).mockResolvedValue(undefined);

      component.handleWidgetCall({
        callId: 'c3',
        widgetType: 'NONEXISTENT'
      });

      tick();

      expect(snackBarStub.open).toHaveBeenCalled();
      expect(moduleServiceStub.getModuleHtml).not.toHaveBeenCalled();
    }));

    it('opens overlay with correct inputs', fakeAsync(() => {
      const calcWidget = {
        key: 'calc@1.0',
        metadata: { model: 'calculator', type: 'widget' }
      } as unknown as VeronaModuleClass;
      moduleServiceStub.widgets = { 'calc@1.0': calcWidget };

      const fakeInstance = {
        widgetHtml: '',
        widgetCallData: undefined as WidgetCallData | undefined,
        playerPostMessageTarget: undefined as Window | undefined,
        playerSessionId: '',
        overlayRef: undefined as unknown
      };
      const fakeOverlayRef = {
        attach: jest.fn().mockReturnValue({ instance: fakeInstance }),
        dispose: jest.fn()
      };
      jest.spyOn(TestBed.inject(Overlay), 'create')
        .mockReturnValue(fakeOverlayRef as unknown as ReturnType<Overlay['create']>);

      const playerTarget = { postMessage: jest.fn() } as unknown as Window;
      component.postMessageTarget = playerTarget;
      component.sessionId = 'sess-99';

      const callData = {
        callId: 'c4',
        widgetType: 'CALCULATOR',
        parameters: { p: '1' },
        state: 'saved-state'
      };

      component.handleWidgetCall(callData);

      tick();
      tick();

      expect(fakeInstance.widgetHtml).toBe('<html lang="">Widget</html>');
      expect(fakeInstance.widgetCallData).toEqual(callData);
      expect(fakeInstance.playerPostMessageTarget).toBe(playerTarget);
      expect(fakeInstance.playerSessionId).toBe('sess-99');
      expect(fakeInstance.overlayRef).toBe(fakeOverlayRef);
    }));
  });
});
