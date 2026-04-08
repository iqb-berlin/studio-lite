import {
  Directive, ElementRef, inject, NgZone, OnDestroy
} from '@angular/core';
import {
  fromEvent, merge, Subject, takeUntil, throttleTime
} from 'rxjs';
import { HeartbeatService } from '../services/heartbeat.service';

@Directive({
  selector: 'iframe[studioLiteTrackIframeActivity]',
  standalone: true
})
export class TrackIframeActivityDirective implements OnDestroy {
  private elementRef = inject(ElementRef<HTMLIFrameElement>);
  private heartbeatService = inject(HeartbeatService);
  private ngZone = inject(NgZone);
  private ngUnsubscribe = new Subject<void>();
  private iframeUnsubscribe = new Subject<void>();

  constructor() {
    this.elementRef.nativeElement.addEventListener('load', () => this.attachListeners());
    // Initial attach for already loaded iframes (like srcdoc iframes)
    this.attachListeners();
  }

  private attachListeners() {
    const win = this.elementRef.nativeElement.contentWindow;
    if (!win) return;

    // Clean up previous listeners if this is a reload
    this.iframeUnsubscribe.next();
    this.iframeUnsubscribe.complete();
    this.iframeUnsubscribe = new Subject<void>();

    this.ngZone.runOutsideAngular(() => {
      merge(
        fromEvent(win, 'mousemove', { passive: true }),
        fromEvent(win, 'keydown', { passive: true }),
        fromEvent(win, 'mousedown', { passive: true }),
        fromEvent(win, 'touchstart', { passive: true })
      ).pipe(
        throttleTime(1000),
        takeUntil(merge(this.ngUnsubscribe, this.iframeUnsubscribe))
      ).subscribe(() => {
        // We call refreshActivityPulse directly since throttling is handled here
        this.heartbeatService.refreshActivityPulse();
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.iframeUnsubscribe.next();
    this.iframeUnsubscribe.complete();
  }
}
