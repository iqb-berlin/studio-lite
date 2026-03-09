import { ElementRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Overlay } from '@angular/cdk/overlay';
import { AppService } from '../../../services/app.service';
import { WorkspaceBackendService } from '../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../workspace/services/workspace.service';
import { ModuleService } from '../services/module.service';
import { UnitState } from '../../../models/verona.interface';
import { PreviewDirective } from './preview.directive';
import { VeronaModuleDirective } from './verona-module.directive';

const createIFrameWithWindow =
  (contentWindow: Window): HTMLIFrameElement => ({ contentWindow } as unknown as HTMLIFrameElement);

const createMessageEvent =
  <T>(data: T, source: Window): MessageEvent<T> => ({ data, source } as unknown as MessageEvent<T>);

class TestPreviewDirective extends PreviewDirective {
  moduleService: ModuleService;
  translateService: TranslateService;
  snackBar: MatSnackBar;
  backendService: WorkspaceBackendService;
  workspaceService: WorkspaceService;
  appService: AppService;
  hostingIframe: ElementRef;
  override errorDialog: MatDialog;

  gotoUnit = jest.fn();
  handleUnitStateData = jest.fn();
  override handleWidgetCall = jest.fn();
  sendChangeData = jest.fn();
  onSelectedUnitChange = jest.fn();
  postStore = jest.fn();

  constructor() {
    super();
    this.moduleService = { loadList: jest.fn() } as unknown as ModuleService;
    this.translateService = { instant: jest.fn((key: string) => key) } as unknown as TranslateService;
    this.snackBar = { open: jest.fn() } as unknown as MatSnackBar;
    this.backendService = { getUnitDefinition: jest.fn() } as unknown as WorkspaceBackendService;
    this.workspaceService = { selectedWorkspaceId: 1 } as unknown as WorkspaceService;
    this.appService = { postMessage$: new Subject<MessageEvent>() } as unknown as AppService;
    this.hostingIframe = { nativeElement: document.createElement('iframe') } as ElementRef;
    this.errorDialog = { open: jest.fn() } as unknown as MatDialog;
  }
}

const createDirective = (): TestPreviewDirective => TestBed.runInInjectionContext(
  () => new TestPreviewDirective()
);

describe('PreviewDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ModuleService, useValue: { widgets: {}, loadWidgets: jest.fn() } },
        Overlay,
        ViewContainerRef
      ]
    });
  });

  it('handles ready notification and initializes session', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    jest.spyOn(VeronaModuleDirective, 'getSessionId').mockReturnValue('session-1');

    const message = createMessageEvent({ type: 'player', apiVersion: '2' }, mockWindow);

    directive.handleIncomingMessage(message);

    expect(directive.playerApiVersion).toBe(2);
    expect(directive.sessionId).toBe('session-1');
    expect(directive.postMessageTarget).toBe(mockWindow as Window);
    expect(directive.sendChangeData).toHaveBeenCalled();
  });

  it('updates page list and unit state on vopStateChangedNotification', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    const message = createMessageEvent(
      {
        type: 'vopStateChangedNotification',
        playerState: {
          validPages: [{ id: 'p1' }, { id: 'p2' }],
          currentPage: 'p1'
        },
        unitState: {
          presentationProgress: 'complete',
          responseProgress: 'some'
        } as UnitState
      },
      mockWindow
    );

    directive.handleIncomingMessage(message);

    expect(directive.pageList.length).toBe(4);
    expect(directive.presentationProgress).toBe('complete');
    expect(directive.responseProgress).toBe('some');
    expect(directive.handleUnitStateData).toHaveBeenCalled();
  });

  it('routes page navigation request and shows notification', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    const gotoPageSpy = jest.spyOn(directive, 'gotoPage');

    const message = createMessageEvent(
      {
        type: 'vo.FromPlayer.PageNavigationRequest',
        newPage: 'p2'
      },
      mockWindow
    );

    directive.handleIncomingMessage(message);

    expect(directive.snackBar.open).toHaveBeenCalled();
    expect(gotoPageSpy).toHaveBeenCalledWith({ action: 'p2' });
  });

  it('forwards unit navigation requests', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    const message = createMessageEvent(
      {
        type: 'vopUnitNavigationRequestedNotification',
        navigationTarget: 'unit-2'
      },
      mockWindow
    );

    directive.handleIncomingMessage(message);

    expect(directive.gotoUnit).toHaveBeenCalledWith('unit-2');
  });

  it('sets focus state when notified', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    const message = createMessageEvent(
      {
        type: 'vopWindowFocusChangedNotification',
        hasFocus: true
      },
      mockWindow
    );

    directive.handleIncomingMessage(message);

    expect(directive.hasFocus).toBe(true);
  });

  it('opens error dialog on vopRuntimeErrorNotification', () => {
    const directive = createDirective();
    const mockWindow = window;
    directive.iFrameElement = createIFrameWithWindow(mockWindow);

    const message = createMessageEvent(
      {
        type: 'vopRuntimeErrorNotification',
        sessionId: 'session-1',
        message: 'Something went wrong'
      },
      mockWindow
    );

    directive.handleIncomingMessage(message);

    expect(directive.errorDialog.open).toHaveBeenCalledWith(
      expect.anything(),
      {
        data: {
          sessionId: 'session-1',
          message: 'Something went wrong'
        }
      }
    );
  });

  it('builds page list for valid pages and updates current page', () => {
    const directive = createDirective();

    directive.setPageList(['p1', 'p2'], 'p1');

    expect(directive.pageList.length).toBe(4);
    expect(directive.pageList[0]).toMatchObject({
      id: '#previous',
      disabled: true
    });

    directive.setPageList(undefined, 'p2');

    const gotoItems = directive.pageList.filter(p => p.type === '#goto');
    const active = gotoItems.find(p => p.disabled);
    expect(active?.id).toBe('p2');
  });

  it('sends page navigation commands based on api version', () => {
    const directive = createDirective();
    const postMessageTarget = { postMessage: jest.fn() } as unknown as Window;

    directive.pageList = [
      {
        index: -1,
        id: '#previous',
        disabled: true,
        type: '#previous'
      },
      {
        index: 1,
        id: 'p1',
        disabled: true,
        type: '#goto'
      },
      {
        index: 2,
        id: 'p2',
        disabled: false,
        type: '#goto'
      },
      {
        index: -1,
        id: '#next',
        disabled: false,
        type: '#next'
      }
    ];
    directive.postMessageTarget = postMessageTarget;
    directive.sessionId = 'session-2';

    directive.playerApiVersion = 2;
    directive.gotoPage({ action: '#next' });

    expect(postMessageTarget.postMessage).toHaveBeenCalledWith(
      {
        type: 'vopPageNavigationCommand',
        sessionId: 'session-2',
        target: 'p2'
      },
      '*'
    );

    (postMessageTarget.postMessage as jest.Mock).mockClear();

    directive.playerApiVersion = 1;
    directive.gotoPage({ action: '#next' });

    expect(postMessageTarget.postMessage).toHaveBeenCalledWith(
      {
        type: 'vo.ToPlayer.NavigateToPage',
        sessionId: 'session-2',
        newPage: 'p2'
      },
      '*'
    );
  });
});
