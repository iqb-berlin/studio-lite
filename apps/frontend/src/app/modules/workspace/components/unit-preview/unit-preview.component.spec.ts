import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
  BehaviorSubject, NEVER, of, Subject
} from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router, UrlCreationOptions, UrlTree } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Overlay } from '@angular/cdk/overlay';
import { ShowCodingResultsComponent } from '@iqb/ngx-coding-components';
import { CodingSchemeFactory } from '@iqb/responses';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { Response } from '@iqbspecs/response/response.interface';
import { environment } from '../../../../../environments/environment';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
import { PreviewService } from '../../services/preview.service';
import { ModuleService } from '../../../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { HeartbeatService } from '../../../../services/heartbeat.service';
import { UnitPreviewComponent } from './unit-preview.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import { PageData } from '../../models/page-data.interface';
import { Progress } from '../../models/types';
import { VeronaModuleClass } from '../../../../models/verona-module.class';
import { WidgetCallData } from '../../models/widget-call-data.interface';
import { ShowResponsesComponent } from '../show-responses/show-responses.component';

describe('UnitPreviewComponent', () => {
  let component: UnitPreviewComponent;
  let fixture: ComponentFixture<UnitPreviewComponent>;
  let snackBarStub: MatSnackBar;
  let dialogStub: MatDialog;
  let routerStub: Router;
  let workspaceServiceStub: WorkspaceService;
  let unitStoresStub: UnitStoresService;
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
    } as never;

    dialogStub = {
      open: jest.fn()
    } as never;

    routerStub = {
      serializeUrl: jest.fn(),
      createUrlTree: jest.fn(),
      routerState: { snapshot: { url: '/a/1' } }
    } as never;

    backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null)),
      getDirectDownloadLink: jest.fn().mockReturnValue('direct')
    } as never;

    workspaceServiceStub = {
      selectedUnit$: new BehaviorSubject<number>(5),
      selectedWorkspaceId: 7,
      groupId: 9
    } as never;

    unitStoresStub = {
      changed: jest.fn().mockReturnValue(false),
      metadataStore: () => undefined,
      definitionStore$: new Subject<void>(),
      loadDefinitionStore: jest.fn().mockReturnValue(of(undefined)),
      loadSchemeStore: jest.fn().mockReturnValue(of(undefined))
    } as never;

    const previewServiceStub = {
      pagingMode: new BehaviorSubject<string>('linear')
    } as never;

    moduleServiceStub = {
      players: {},
      widgets: {},
      loadWidgets: jest.fn().mockResolvedValue(undefined),
      getModuleHtml: jest.fn().mockResolvedValue('<html lang="">Widget</html>')
    } as never;

    const appServiceStub = { postMessage$: new Subject<MessageEvent>() } as never;

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
        { provide: UnitStoresService, useValue: unitStoresStub },
        { provide: PreviewService, useValue: previewServiceStub },
        { provide: ModuleService, useValue: moduleServiceStub },
        { provide: AppService, useValue: appServiceStub },
        { provide: HeartbeatService, useValue: { refreshActivityPulse: jest.fn() } },
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

  afterEach(() => {
    jest.restoreAllMocks();
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

  // #1361: the check takes the scheme as it is now, saved or not, as the player shows the definition
  it('checks the coding with unsaved changes too, from the scheme store', async () => {
    jest.spyOn(unitStoresStub, 'changed').mockReturnValue(true);

    await component.checkCodingChanged();

    expect(unitStoresStub.loadSchemeStore).toHaveBeenCalledWith(7, 5);
    expect(snackBarStub.open).not.toHaveBeenCalledWith(
      'workspace.save-unit-before-check',
      expect.anything(),
      expect.anything()
    );
  });

  it('passes the coding variables to the coding results dialog', async () => {
    const variableCodings = [
      {
        id: 'internal-id',
        alias: 'visible-id',
        sourceType: 'BASE',
        fragmenting: String.raw`^([A-Z]+)-(\d+)$`,
        codes: [{ id: 1 }]
      } as unknown as VariableCodingData
    ];
    const codedResponses = [
      {
        id: 'visible-id',
        value: 'ABC-007',
        status: 'CODING_COMPLETE'
      } as Response
    ];
    jest.spyOn(unitStoresStub, 'loadSchemeStore').mockReturnValue(of(
      new UnitSchemeStore(5, { scheme: JSON.stringify({ variableCodings }), schemeType: 'iqb@3.4' })
    ));
    const codeSpy = jest.spyOn(CodingSchemeFactory, 'code')
      .mockReturnValue(codedResponses);

    await component.checkCodingChanged();

    const usedVariableCodings = codeSpy.mock.calls[0][1];
    const [dialogComponent, dialogConfig] =
      (dialogStub.open as jest.Mock).mock.calls[0];

    expect(usedVariableCodings).toEqual(variableCodings);
    expect(dialogComponent).toBe(ShowCodingResultsComponent);
    expect(dialogConfig.data.responses).toBe(codedResponses);
    expect(dialogConfig.data.varsWithCodes).toEqual(['visible-id']);
    expect(dialogConfig.data.variableCodings).toBe(usedVariableCodings);
    expect(dialogConfig.height).toBe('80%');
    expect(dialogConfig.width).toBe('60%');

    const resultsComponent = new ShowCodingResultsComponent(dialogConfig.data);
    resultsComponent.ngOnInit();
    resultsComponent.toggleChange({
      source: { name: 'transformedValueView' }
    } as unknown as MatSlideToggleChange);

    expect(resultsComponent.dataSource.data[0]['transformed'])
      .toBe('["ABC","007"]');
  });

  // #1848: before the player has reported anything, the scheme's variables are shown without values
  it('checks the coding before the player has reported any responses', async () => {
    const variableCodings = [
      {
        id: 'text_1', alias: 'Antwort', sourceType: 'BASE', codes: []
      } as unknown as VariableCodingData
    ];
    jest.spyOn(unitStoresStub, 'loadSchemeStore').mockReturnValue(of(
      new UnitSchemeStore(5, { scheme: JSON.stringify({ variableCodings }), schemeType: 'iqb@3.4' })
    ));

    await component.checkCodingChanged();

    expect(dialogStub.open).toHaveBeenCalledWith(
      ShowCodingResultsComponent,
      expect.objectContaining({
        data: expect.objectContaining({ responses: [{ id: 'Antwort', value: null, status: 'UNSET' }] })
      })
    );
  });

  describe('handleWidgetCall', () => {
    it('loads widgets when none are cached', fakeAsync(() => {
      moduleServiceStub.widgets = {};

      const calcWidget = {
        key: 'calc@1.0',
        metadata: { model: 'CALC', type: 'WIDGET' }
      } as VeronaModuleClass;

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
      } as never);

      component.handleWidgetCall({
        callId: 'c1',
        widgetType: 'CALC',
        parameters: [{ key: 'K', value: 'v' }],
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
        metadata: { model: 'CALC', type: 'WIDGET' }
      } as VeronaModuleClass;
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
      } as never);

      component.handleWidgetCall({
        callId: 'c2',
        widgetType: 'CALC'
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
        metadata: { model: 'CALC', type: 'WIDGET' }
      } as VeronaModuleClass;
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
        .mockReturnValue(fakeOverlayRef as never);

      const playerTarget = { postMessage: jest.fn() } as never;
      component.postMessageTarget = playerTarget;
      component.sessionId = 'sess-99';

      const callData = {
        callId: 'c4',
        widgetType: 'CALC',
        parameters: [{ key: 'P', value: '1' }],
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

  describe('postStore', () => {
    const store = { getData: () => ({ definition: 'def' }) } as never;

    const playerConfigOf = (target: { postMessage: jest.Mock }) => target.postMessage.mock
      .calls[0][0].playerConfig;

    it('should send stateReportPolicy to players below spec version 5', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.playerApiVersion = 3;

      component.postStore(store);

      expect(playerConfigOf(target)).toHaveProperty('stateReportPolicy', 'eager');
    });

    it('should omit stateReportPolicy from spec version 5 on', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.playerApiVersion = 6;

      component.postStore(store);

      expect(playerConfigOf(target)).not.toHaveProperty('stateReportPolicy');
    });

    it('should send the definition type at the top level when it is known', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.playerApiVersion = 6;

      component.postStore({
        getData: () => ({ definition: 'def', definitionType: 'aspect-unit-definition@4.12.0' })
      } as never);

      const message = target.postMessage.mock.calls[0][0];
      expect(message.unitDefinitionType).toBe('aspect-unit-definition@4.12.0');
      expect(message.playerConfig).not.toHaveProperty('unitDefinitionType');
    });

    it('should send no definition type when none is known', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.playerApiVersion = 6;

      component.postStore(store);

      expect(target.postMessage.mock.calls[0][0]).not.toHaveProperty('unitDefinitionType');
    });

    it.each([
      [1, 'def', 'vo.ToPlayer.DataTransfer', 'def'],
      [1, undefined, 'vo.ToPlayer.DataTransfer', ''],
      [6, undefined, 'vopStartCommand', '']
    ])('should hand a player of version %s the definition %s in its protocol', (version, definition, type, sent) => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.playerApiVersion = version;

      component.postStore({ getData: () => ({ definition }) } as never);

      expect(target.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type, unitDefinition: sent }), '*');
    });

    it('should let the next page report decide the list of the restarted unit', () => {
      component.postMessageTarget = { postMessage: jest.fn() } as never;
      component.playerApiVersion = 6;
      component.setPageList(['0', '1', '2'], '0');

      component.postStore(store);
      component.setPageList(['0'], '0');

      expect(component.pageList).toEqual([]);
    });
  });

  describe('definition type warning', () => {
    const aspectModel = 'aspect-unit-definition@>=4.0 <=4.12';
    const player = (key: string, version: string, model?: string) => new VeronaModuleClass({
      key,
      sortKey: key,
      metadata: {
        id: key, name: key.split('@')[0], version, model, type: 'PLAYER'
      }
    } as never);
    const storeWith = (definitionType?: string) => ({
      getData: () => ({ definition: 'def', definitionType })
    }) as never;

    beforeEach(() => {
      component.postMessageTarget = { postMessage: jest.fn() } as never;
      component.playerApiVersion = 6;
      component.playerName = 'iqb-player-aspect@3.0';
    });

    it('should warn and name a fitting player when the selected one does not read the format', () => {
      moduleServiceStub.players = {
        'iqb-player-aspect@3.0': player('iqb-player-aspect@3.0', '3.0.1', aspectModel),
        'iqb-player-aspect@4.0': player('iqb-player-aspect@4.0', '4.0.0', 'aspect-unit-definition@>=5.0 <=5.2')
      };

      component.postStore(storeWith('aspect-unit-definition@5.1.0'));

      expect(component.definitionTypeWarning).toContain('workspace.definition-type-incompatible');
      expect(component.definitionTypeWarning).toContain('workspace.definition-type-alternatives');
    });

    it('should say so when no installed player reads the format', () => {
      moduleServiceStub.players = {
        'iqb-player-aspect@3.0': player('iqb-player-aspect@3.0', '3.0.1', aspectModel)
      };

      component.postStore(storeWith('aspect-unit-definition@5.1.0'));

      expect(component.definitionTypeWarning).toContain('workspace.definition-type-incompatible');
      expect(component.definitionTypeWarning).toContain('workspace.definition-type-no-alternative');
    });

    it('should not warn when the player reads the format', () => {
      moduleServiceStub.players = {
        'iqb-player-aspect@3.0': player('iqb-player-aspect@3.0', '3.0.1', aspectModel)
      };

      component.postStore(storeWith('aspect-unit-definition@4.12.0'));

      expect(component.definitionTypeWarning).toBe('');
    });

    it('should not warn when the unit has no type', () => {
      moduleServiceStub.players = {
        'iqb-player-aspect@3.0': player('iqb-player-aspect@3.0', '3.0.1', aspectModel)
      };

      component.postStore(storeWith(undefined));

      expect(component.definitionTypeWarning).toBe('');
    });

    it('should not warn when the player declares no model', () => {
      moduleServiceStub.players = {
        'iqb-player-aspect@3.0': player('iqb-player-aspect@3.0', '2.12.6', '')
      };

      component.postStore(storeWith('aspect-unit-definition@5.1.0'));

      expect(component.definitionTypeWarning).toBe('');
    });

    it('should drop the warning of the unit left behind', () => {
      component.definitionTypeWarning = 'old warning';
      component.unitLoaded.next(true);
      workspaceServiceStub.loadUnitProperties = jest.fn().mockReturnValue(new Subject<void>());

      component.onSelectedUnitChange();

      expect(component.definitionTypeWarning).toBe('');
    });
  });

  describe('onLoadUnitProperties', () => {
    it('should drop the page list of the unit left behind', () => {
      component.setPageList(['p1', 'p2', 'p3'], 'p1');

      component.onLoadUnitProperties();

      expect(component.pageList).toEqual([]);
    });

    it('should name the player it loads for the unit', () => {
      const playerKey = 'iqb-player-aspect@3.0';
      moduleServiceStub.players = { [playerKey]: createMock<VeronaModuleClass>() };
      jest.spyOn(unitStoresStub, 'metadataStore').mockReturnValue(createMock<UnitMetadataStore>({
        getData: () => ({ id: 5, player: playerKey }) as UnitPropertiesDto
      }));

      component.onLoadUnitProperties();

      expect(component.playerName).toBe(playerKey);
    });
  });

  it('should load the unit chosen while the one before is still loading', () => {
    workspaceServiceStub.loadUnitProperties = jest.fn().mockReturnValue(NEVER);
    component.unitLoaded.next(false);

    workspaceServiceStub.selectedUnit$.next(6);

    expect(workspaceServiceStub.loadUnitProperties).toHaveBeenCalledTimes(1);
  });

  describe('the responses the player reports', () => {
    const report = (unitState: object) => component.handleIncomingMessage(new MessageEvent('message', {
      data: { type: 'vopStateChangedNotification', unitState },
      source: fixture.nativeElement.querySelector('iframe').contentWindow
    }));
    const response = (id: string, value: string): Response => ({ id, value, status: 'VALUE_CHANGED' });
    const dataPart = (...responses: Response[]) => JSON.stringify(responses);
    const withScheme = (scheme: string) => jest.spyOn(unitStoresStub, 'loadSchemeStore')
      .mockReturnValue(of(new UnitSchemeStore(5, { scheme, schemeType: 'iqb@3.4' })));
    // the scheme column of a unit without one is null
    const withoutScheme = () => withScheme(JSON.stringify(null));

    it('should code the last report of every data part', async () => {
      withScheme(JSON.stringify({ variableCodings: [] }));
      const code = jest.spyOn(CodingSchemeFactory, 'code').mockReturnValue([]);
      report({ dataParts: { a: dataPart(response('a1', 'first')) } });
      report({ dataParts: { b: dataPart(response('b1', 'other')) } });
      report({ dataParts: { a: dataPart(response('a1', 'second')) } });

      await component.checkCodingChanged();

      expect(code.mock.calls[0][0]).toEqual([response('a1', 'second'), response('b1', 'other')]);
    });

    it('should name the coded variables of a scheme without aliases by their ids', async () => {
      withScheme(JSON.stringify({ variableCodings: [{ id: 'v1', sourceType: 'BASE', codes: [{ id: 1 }] }] }));
      jest.spyOn(CodingSchemeFactory, 'code').mockReturnValue([]);

      await component.checkCodingChanged();

      expect(dialogStub.open).toHaveBeenCalledWith(ShowCodingResultsComponent, expect.objectContaining({
        data: expect.objectContaining({ varsWithCodes: ['v1'] })
      }));
    });

    // a later report without data parts keeps the type of those before
    it.each([
      ['iqb-standard@1.0', true],
      ['other-format@1.0', false],
      [undefined, false]
    ])('should show the responses of a unit without a scheme, of data type %s as a table: %s', async (
      unitStateDataType, table
    ) => {
      withoutScheme();
      report({ dataParts: { a: dataPart(response('a1', 'x')) }, unitStateDataType });
      report({ presentationProgress: 'some' });

      await component.checkCodingChanged();

      expect(dialogStub.open).toHaveBeenCalledWith(ShowResponsesComponent, expect.objectContaining({
        data: { responses: [response('a1', 'x')], table }
      }));
    });

    it('should say that there is nothing to check without a scheme and without responses', async () => {
      withoutScheme();

      await component.checkCodingChanged();

      expect(dialogStub.open).not.toHaveBeenCalled();
      expect(snackBarStub.open).toHaveBeenCalledWith(
        'workspace.coding-check-error',
        'workspace.error',
        expect.anything()
      );
    });
  });

  describe('printing', () => {
    it('should ask to save the unit first while it has unsaved changes', () => {
      jest.spyOn(unitStoresStub, 'changed').mockReturnValue(true);

      component.showPrintOptions();

      expect(dialogStub.open).not.toHaveBeenCalled();
      expect(snackBarStub.open).toHaveBeenCalledWith(
        'workspace.save-unit-before-check',
        'workspace.error',
        expect.anything()
      );
    });

    it.each([
      [[{ key: 'printPreviewHeight', value: 1000 }], true],
      [undefined, false]
    ])('should open the print view when the options dialog closes with %j: %s', (options, printed) => {
      (dialogStub.open as jest.Mock).mockReturnValue({ afterClosed: () => of(options) });
      jest.spyOn(window, 'open').mockReturnValue(null);

      component.showPrintOptions();

      expect(window.open).toHaveBeenCalledTimes(printed ? 1 : 0);
    });
  });
});
