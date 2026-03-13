import { Injectable, OnDestroy } from '@angular/core';
import {
  interval, Subscription, fromEvent, of, timer, combineLatest, merge
} from 'rxjs';

import {
  switchMap, filter, distinctUntilChanged, startWith, map, throttleTime, scan, catchError
} from 'rxjs/operators';
import { AppService } from './app.service';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private heartbeatSubscription: Subscription | null = null;
  private readonly idleTimeoutMs = 3600000; // 60 minutes
  private readonly intervalMs = 60000; // 1 minute

  constructor(
    private appService: AppService,
    private backendService: BackendService
  ) {}

  start(): void {
    if (this.heartbeatSubscription) {
      return;
    }

    const visibilityChanged$ = fromEvent(document, 'visibilitychange').pipe(
      map(() => document.visibilityState === 'visible'),
      startWith(document.visibilityState === 'visible'),
      distinctUntilChanged()
    );

    const pointerActivity$ = fromEvent<PointerEvent>(window, 'pointermove').pipe(
      throttleTime(2000),
      map(event => ({ x: event.clientX, y: event.clientY })),
      scan((acc, curr) => {
        if (acc.x === -1) return curr; // Initialize baseline with first event
        const threshold = 15; // Increased threshold for noise reduction
        const moved = Math.abs(acc.x - curr.x) > threshold || Math.abs(acc.y - curr.y) > threshold;
        return moved ? curr : acc;
      }, { x: -1, y: -1 }),
      distinctUntilChanged((p, q) => p.x === q.x && p.y === q.y)
    );

    const activity$ = merge(
      pointerActivity$,
      fromEvent(window, 'keydown'),
      fromEvent(window, 'pointerdown'),
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'wheel'),
      fromEvent(window, 'focus')
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
            switchMap(() => this.backendService.ping().pipe(
              catchError(() => of(null)),
              map(() => null)
            ))
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
