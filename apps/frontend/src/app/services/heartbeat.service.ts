import { Injectable, OnDestroy } from '@angular/core';
import {
  interval, Subscription, of
} from 'rxjs';
import {
  switchMap, filter, distinctUntilChanged, startWith, map, catchError
} from 'rxjs/operators';
import { AppService } from './app.service';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private heartbeatSubscription: Subscription | null = null;
  private readonly intervalMs = 60000; // 1 minute

  constructor(
    private appService: AppService,
    private backendService: BackendService
  ) {}

  start(): void {
    if (this.heartbeatSubscription) {
      return;
    }

    // Simplified logic: Ping every minute if the tab is visible
    const visibilityChanged$ = interval(this.intervalMs).pipe(
      startWith(0),
      map(() => document.visibilityState === 'visible'),
      distinctUntilChanged()
    );

    this.heartbeatSubscription = visibilityChanged$.pipe(
      switchMap(isVisible => {
        if (isVisible) {
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
