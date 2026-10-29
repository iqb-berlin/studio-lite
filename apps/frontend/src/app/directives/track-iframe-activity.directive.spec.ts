import {
  Component, ElementRef, Injector, runInInjectionContext, ViewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TrackIframeActivityDirective } from './track-iframe-activity.directive';
import { HeartbeatService } from '../services/heartbeat.service';

@Component({
  template: '<iframe #iframe studioLiteTrackIframeActivity></iframe>',
  standalone: true,
  imports: [TrackIframeActivityDirective]
})
class TestHostComponent {
  @ViewChild('iframe') iframe!: ElementRef<HTMLIFrameElement>;
}

describe('TrackIframeActivityDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let heartbeatServiceMock: DeepMocked<HeartbeatService>;

  beforeEach(async () => {
    heartbeatServiceMock = createMock<HeartbeatService>();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: HeartbeatService, useValue: heartbeatServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should attach listeners to iframe contentWindow on load', done => {
    const iframe = fixture.componentInstance.iframe.nativeElement;
    // Mock contentWindow
    const mockWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as unknown as Window;

    Object.defineProperty(iframe, 'contentWindow', { get: () => mockWindow });

    // Trigger load
    iframe.dispatchEvent(new Event('load'));

    // Check if mousemove listener was attached (called by RxJS fromEvent)
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), expect.any(Object));
    done();
  });

  // Inside an @if the frame is created before it is in the page, and has no window yet.
  it('should wait for the window of a frame that is not in the page yet', () => {
    const iframe = document.createElement('iframe');
    const injector = Injector.create({
      providers: [{ provide: ElementRef, useValue: new ElementRef(iframe) }],
      parent: TestBed.inject(Injector)
    });
    const directive = runInInjectionContext(injector, () => new TrackIframeActivityDirective());

    document.body.appendChild(iframe);
    iframe.dispatchEvent(new Event('load'));
    iframe.contentWindow?.dispatchEvent(new Event('keydown'));

    expect(heartbeatServiceMock.refreshActivityPulse).toHaveBeenCalled();
    directive.ngOnDestroy();
    iframe.remove();
  });
});
