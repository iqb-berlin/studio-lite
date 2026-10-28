import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { createMock } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../../../services/backend.service';
import { HeartbeatService } from '../../../../services/heartbeat.service';
import { VeronaModuleDirective } from '../../../../directives/verona-module.directive';
import { WidgetOverlayComponent } from './widget-overlay.component';
import { WidgetCallData } from '../../models/widget-call-data.interface';

describe('WidgetOverlayComponent', () => {
  type WidgetOverlayTestAccess = {
    widgetState: string;
    widgetPostMessageTarget?: Window;
    ngUnsubscribe: Subject<void>;
  };

  let component: WidgetOverlayComponent;
  let fixture: ComponentFixture<WidgetOverlayComponent>;
  let postMessage$: Subject<MessageEvent>;
  let overlayRefStub: OverlayRef;
  let playerPostMessageTarget: { postMessage: jest.Mock };

  const callData: WidgetCallData = {
    callId: 'call-42',
    widgetType: 'CALC',
    parameters: { key1: 'val1' },
    state: 'initial-state',
    sharedParameters: { shared1: 'sv1' }
  };

  beforeEach(async () => {
    postMessage$ = new Subject<MessageEvent>();
    overlayRefStub = createMock<OverlayRef>({ dispose: jest.fn() });
    playerPostMessageTarget = { postMessage: jest.fn() };

    const mockAppService = {
      postMessage$,
      authData: { userId: 1 } as AuthDataDto,
      authDataChanged: new Subject<AuthDataDto>()
    } as AppService;

    const mockBackendService = createMock<BackendService>({
      activity: jest.fn(),
      logout: jest.fn()
    });

    await TestBed.configureTestingModule({
      imports: [
        WidgetOverlayComponent,
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: AppService,
          useValue: mockAppService
        },
        {
          provide: BackendService,
          useValue: mockBackendService
        },
        {
          provide: HeartbeatService,
          useValue: createMock<HeartbeatService>({ refreshActivityPulse: jest.fn() })
        },
        {
          provide: 'SERVER_URL',
          useValue: 'http://localhost:4200/'
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetOverlayComponent);
    component = fixture.componentInstance;

    component.widgetHtml = '<html lang=""><body>Widget</body></html>';
    component.widgetCallData = callData;
    component.playerPostMessageTarget = playerPostMessageTarget as never;
    component.playerSessionId = 'player-session-1';
    component.overlayRef = overlayRefStub;

    fixture.detectChanges();
  });

  it('sends vowStartCommand on vowReadyNotification', () => {
    jest.spyOn(VeronaModuleDirective, 'getSessionId')
      .mockReturnValue('widget-session-7');

    const iframeEl = fixture.nativeElement.querySelector('iframe');
    const fakeSource = iframeEl?.contentWindow;
    if (!fakeSource) return;

    const msg = new MessageEvent('message', {
      data: { type: 'vowReadyNotification' }
    });
    Object.defineProperty(msg, 'source', { value: fakeSource });

    postMessage$.next(msg);

    const target = (component as never as WidgetOverlayTestAccess).widgetPostMessageTarget;
    expect(target).toBe(fakeSource);
    expect(fakeSource.postMessage).toBeDefined();
  });

  it('updates widgetState on vowStateChangedNotification', () => {
    const iframeEl = fixture.nativeElement.querySelector('iframe');
    const fakeSource = iframeEl?.contentWindow;
    if (!fakeSource) return;

    postMessage$.next({
      data: { type: 'vowStateChangedNotification', state: 'new-state' },
      source: fakeSource
    } as never as MessageEvent);

    expect((component as never as WidgetOverlayTestAccess).widgetState)
      .toBe('new-state');
  });

  const sendFromWidget = (data: object): void => {
    const fakeSource = fixture.nativeElement.querySelector('iframe').contentWindow;
    expect(fakeSource).toBeTruthy();
    postMessage$.next({
      data,
      source: fakeSource
    } as never as MessageEvent);
  };

  describe('a state change that clears or keeps the state (#1685)', () => {
    const notifyState = (data: object): void => {
      sendFromWidget({ type: 'vowStateChangedNotification', ...data });
    };

    // The periodic table sends '' once every symbol is deselected, and the player has to get
    // exactly that back, not the selection before it.
    it('takes an empty state and returns it to the player', () => {
      notifyState({ state: '' });
      component.continue();

      expect(playerPostMessageTarget.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'vopWidgetReturn', state: '' }),
        '*'
      );
    });

    it('keeps the state when the notification carries none', () => {
      notifyState({});

      expect((component as never as WidgetOverlayTestAccess).widgetState)
        .toBe('initial-state');
    });

    it('keeps the state when the notification carries null', () => {
      notifyState({ state: null });

      expect((component as never as WidgetOverlayTestAccess).widgetState)
        .toBe('initial-state');
    });
  });

  it('ignores messages from unknown sources', () => {
    const otherWindow = {} as never;

    postMessage$.next({
      data: { type: 'vowStateChangedNotification', state: 'hacked' },
      source: otherWindow
    } as never as MessageEvent);

    expect((component as never as WidgetOverlayTestAccess).widgetState)
      .toBe('initial-state');
  });

  it('close() disposes overlay without sending return by default', () => {
    component.close();

    expect(overlayRefStub.dispose).toHaveBeenCalled();
    expect(playerPostMessageTarget.postMessage).not.toHaveBeenCalled();
  });

  it('continue() sends vopWidgetReturn and disposes overlay', () => {
    (component as never as WidgetOverlayTestAccess).widgetState = 'final-state';

    component.continue();

    expect(playerPostMessageTarget.postMessage).toHaveBeenCalledWith(
      {
        type: 'vopWidgetReturn',
        sessionId: 'player-session-1',
        callId: 'call-42',
        state: 'final-state'
      },
      '*'
    );
    expect(overlayRefStub.dispose).toHaveBeenCalled();
  });

  describe('a return request with state and saveState (#1928)', () => {
    const requestReturn = (data: object): void => {
      sendFromWidget({ type: 'vowReturnRequested', ...data });
    };

    // From verona-widgets-chemistry#9 on, the molecule editor sends its final state, image included,
    // only with the return request.
    it('returns the final state the request carries', () => {
      requestReturn({ state: 'final-state', saveState: true });

      expect(playerPostMessageTarget.postMessage).toHaveBeenCalledWith(
        {
          type: 'vopWidgetReturn',
          sessionId: 'player-session-1',
          callId: 'call-42',
          state: 'final-state'
        },
        '*'
      );
      expect(overlayRefStub.dispose).toHaveBeenCalled();
    });

    it('returns an empty final state', () => {
      requestReturn({ state: '', saveState: true });

      expect(playerPostMessageTarget.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'vopWidgetReturn', state: '' }),
        '*'
      );
    });

    // verona-widgets-chemistry#9 sends the key without a value as well, the periodic table always.
    // A missing saveState means true in the widget API.
    it.each([
      ['undefined', { state: undefined, saveState: true }],
      ['null', { state: null, saveState: true }],
      ['neither state nor saveState', {}]
    ])('keeps the last state when the request carries %s', (_, data) => {
      sendFromWidget({ type: 'vowStateChangedNotification', state: 'last-state' });
      requestReturn(data);

      expect(playerPostMessageTarget.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'vopWidgetReturn', state: 'last-state' }),
        '*'
      );
    });

    it('closes without a return when saveState is false', () => {
      requestReturn({ state: 'discarded-state', saveState: false });

      expect(playerPostMessageTarget.postMessage).not.toHaveBeenCalled();
      expect(overlayRefStub.dispose).toHaveBeenCalled();
    });
  });
});
