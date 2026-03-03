import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../services/app.service';
import { VeronaModuleDirective } from '../../../shared/directives/verona-module.directive';
import { WidgetOverlayComponent } from './widget-overlay.component';
import { WidgetCallData } from '../../models/widget-call-data.interface';

describe('WidgetOverlayComponent', () => {
  let component: WidgetOverlayComponent;
  let fixture: ComponentFixture<WidgetOverlayComponent>;
  let postMessage$: Subject<MessageEvent>;
  let overlayRefStub: OverlayRef;

  const callData: WidgetCallData = {
    callId: 'call-42',
    widgetType: 'CALC',
    parameters: { key1: 'val1' },
    state: 'initial-state',
    sharedParameters: { shared1: 'sv1' }
  };

  beforeEach(async () => {
    postMessage$ = new Subject<MessageEvent>();
    overlayRefStub = { dispose: jest.fn() } as unknown as OverlayRef;

    await TestBed.configureTestingModule({
      imports: [
        WidgetOverlayComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: AppService,
          useValue: { postMessage$ } as unknown as AppService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetOverlayComponent);
    component = fixture.componentInstance;

    component.widgetHtml = '<html lang=""><body>Widget</body></html>';
    component.widgetCallData = callData;
    component.playerPostMessageTarget = {
      postMessage: jest.fn()
    } as unknown as Window;
    component.playerSessionId = 'player-session-1';
    component.overlayRef = overlayRefStub;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialises widgetState from callData on AfterViewInit', () => {
    expect((component as unknown as { widgetState: string }).widgetState)
      .toBe('initial-state');
  });

  it('sends vowStartCommand on vowReadyNotification', () => {
    jest.spyOn(VeronaModuleDirective, 'getSessionId')
      .mockReturnValue('widget-session-7');

    const iframeEl = fixture.nativeElement.querySelector('iframe');
    const fakeSource = iframeEl?.contentWindow;
    if (!fakeSource) return;

    const msg = {
      data: { type: 'vowReadyNotification' },
      source: fakeSource
    } as unknown as MessageEvent;

    postMessage$.next(msg);

    const target = (component as unknown as {
      widgetPostMessageTarget: Window;
    }).widgetPostMessageTarget;
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
    } as unknown as MessageEvent);

    expect((component as unknown as { widgetState: string }).widgetState)
      .toBe('new-state');
  });

  it('ignores messages from unknown sources', () => {
    const otherWindow = {} as Window;

    postMessage$.next({
      data: { type: 'vowStateChangedNotification', state: 'hacked' },
      source: otherWindow
    } as unknown as MessageEvent);

    expect((component as unknown as { widgetState: string }).widgetState)
      .toBe('initial-state');
  });

  it('close() disposes overlay without sending return by default', () => {
    component.close();

    expect(overlayRefStub.dispose).toHaveBeenCalled();
    expect(
      (component.playerPostMessageTarget as unknown as {
        postMessage: jest.Mock;
      }).postMessage
    ).not.toHaveBeenCalled();
  });

  it('continue() sends vopWidgetReturn and disposes overlay', () => {
    (component as unknown as { widgetState: string }).widgetState =
      'final-state';

    component.continue();

    const playerTarget = component.playerPostMessageTarget as unknown as {
      postMessage: jest.Mock;
    };
    expect(playerTarget.postMessage).toHaveBeenCalledWith(
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
    const privateSub = (component as unknown as {
      ngUnsubscribe: Subject<void>;
    }).ngUnsubscribe;
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
    } as unknown as MessageEvent);

    expect(continueSpy).toHaveBeenCalled();
  });
});
