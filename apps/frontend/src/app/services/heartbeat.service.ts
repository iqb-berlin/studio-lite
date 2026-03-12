import { Injectable, OnDestroy } from '@angular/core';
import {
  interval, Subscription, fromEvent, of, timer, combineLatest, merge
} from 'rxjs';

import {
  switchMap, filter, distinctUntilChanged, startWith, map, throttleTime, scan
} from 'rxjs/operators';
import { AppService } from './app.service';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private heartbeatSubscription: Subscription | null = null;
  private readonly intervalMs = 60000; // 1 minute
  private readonly idleTimeoutMs = 300000; // 5 minutes

  constructor(
    private appService: AppService,
    private backendService: BackendService
  ) {}

  start(): void {
    if (this.heartbeatSubscription) {
      return;
    }

    const visibilityChanged$ = merge(
      fromEvent(document, 'visibilitychange'),
      fromEvent(window, 'focus'),
      fromEvent(window, 'blur')
    ).pipe(
      map(() => document.visibilityState === 'visible' && document.hasFocus()),
      startWith(document.visibilityState === 'visible' && document.hasFocus()),
      distinctUntilChanged()
    );

    const mouseActivity$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(
      throttleTime(2000),
      map(event => ({ x: event.clientX, y: event.clientY })),
      scan((acc, curr) => {
        const threshold = 10;
        const moved = Math.abs(acc.x - curr.x) > threshold || Math.abs(acc.y - curr.y) > threshold;
        return moved ? curr : acc;
      }, { x: 0, y: 0 }),
      distinctUntilChanged((p, q) => p.x === q.x && p.y === q.y)
    );

    const activity$ = merge(
      mouseActivity$,
      fromEvent(window, 'keydown'),
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'wheel'),
      fromEvent(window, 'touchstart'),
      fromEvent(window, 'touchmove')
    ).pipe(
      startWith(null)
    );

    const isIdle$ = activity$.pipe(
      switchMap(() => timer(this.idleTimeoutMs).pipe(
        map(() => true),
        startWith(false)
      )),
      distinctUntilChanged()
    );

    this.heartbeatSubscription = combineLatest([visibilityChanged$, isIdle$]).pipe(
      map(([isVisible, isIdle]) => isVisible && !isIdle),
      distinctUntilChanged(),
      switchMap(shouldPing => {
        if (shouldPing) {
          return interval(this.intervalMs).pipe(
            startWith(0),
            filter(() => !!this.appService.authData?.userId),
            switchMap(() => this.backendService.ping().pipe(map(() => null)))
          );
        }
        return of(null);
      })
    ).subscribe();
  }

  stop(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
      this.heartbeatSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
