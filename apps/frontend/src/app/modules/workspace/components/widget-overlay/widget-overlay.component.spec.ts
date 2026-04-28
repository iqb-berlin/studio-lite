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
      ping: jest.fn(),
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialises widgetState from callData on AfterViewInit', () => {
    const testAccess = component as never as WidgetOverlayTestAccess;
    expect(testAccess.widgetState)
      .toBe('initial-state');
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

  it('ngOnDestroy completes the unsubscribe subject', () => {
    const privateSub = (component as never as WidgetOverlayTestAccess).ngUnsubscribe;
    const nextSpy = jest.spyOn(privateSub, 'next');
    const completeSpy = jest.spyOn(privateSub, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('calls continue() on vowReturnRequested', () => {
    const continueSpy = jest.spyOn(component, 'continue');
    const iframeEl = fixture.nativeElement.querySelector('iframe');
    const fakeSource = iframeEl?.contentWindow;
    if (!fakeSource) return;

    postMessage$.next({
      data: { type: 'vowReturnRequested' },
      source: fakeSource
    } as never as MessageEvent);

    expect(continueSpy).toHaveBeenCalled();
  });

  it('should have a close icon button that calls close()', () => {
    const closeSpy = jest.spyOn(component, 'close');
    const closeBtn = fixture.nativeElement.querySelector('.close-button');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.querySelector('mat-icon').textContent).toContain('close');
    closeBtn.click();
    expect(closeSpy).toHaveBeenCalled();
  });
});
