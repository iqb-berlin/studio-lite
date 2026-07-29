import {
  Injectable, NgZone, OnDestroy, inject
} from '@angular/core';
import {
  of, BehaviorSubject, timer, Subject, asapScheduler, merge, fromEvent
} from 'rxjs';
import {
  switchMap, filter, distinctUntilChanged, map, catchError, shareReplay, takeUntil, observeOn,
  throttleTime
} from 'rxjs/operators';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS,
  PASSIVE_THRESHOLD_MS,
  UI_BAR_REFRESH_INTERVAL_MS,
  ACTIVITY_SYNC_THROTTLE_MS,
  USER_ACTIVITY_THROTTLE_MS,
  POST_MESSAGE_ACTIVITY_THROTTLE_MS,
  AUTO_LOGOUT_REDIRECT_DELAY_MS
} from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private started = false;
  private readonly activityThresholdMs = ACTIVE_THRESHOLD_MS;
  // PASSIVE_THRESHOLD_MS is treated as the total inactivity timeout from last activity.
  // If productive values change, keep ACTIVE <= PASSIVE to preserve a visible passive phase.
  private readonly inactivityTimeoutMs = PASSIVE_THRESHOLD_MS;
  private readonly passivePhaseMs = Math.max(this.inactivityTimeoutMs - this.activityThresholdMs, 0);
  private readonly ngZone = inject(NgZone);

  private readonly lastActivityPulse$ = new BehaviorSubject<number>(Date.now());
  private readonly activitySync$ = new Subject<void>();
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly STORAGE_KEY = 'st_activity_pulse';

  readonly activityStatus$ = timer(0, UI_BAR_REFRESH_INTERVAL_MS).pipe(
    observeOn(asapScheduler),
    switchMap(() => this.lastActivityPulse$),
    map(lastPulse => this.calculateActivityStatus(lastPulse)),
    distinctUntilChanged((prev, curr) => prev.activePercentage === curr.activePercentage &&
      prev.passivePercentage === curr.passivePercentage),
    shareReplay(1)
  );

  private getNow(): number {
    return this.appService.getServerTime();
  }

  private calculateActivityStatus(lastPulse: number, now = this.getNow()): {
    activePercentage: number;
    passivePercentage: number;
  } {
    const diff = now - lastPulse;

    if (diff <= this.activityThresholdMs) {
      const activeP = ((this.activityThresholdMs - diff) / this.activityThresholdMs) * 100;
      return {
        activePercentage: Math.max(0, Math.min(100, activeP)),
        passivePercentage: 100
      };
    }

    if (this.passivePhaseMs <= 0) {
      return {
        activePercentage: 0,
        passivePercentage: 0
      };
    }

    const passiveDiff = diff - this.activityThresholdMs;
    const passiveP = ((this.passivePhaseMs - passiveDiff) / this.passivePhaseMs) * 100;

    return {
      activePercentage: 0,
      passivePercentage: Math.max(0, Math.min(100, passiveP))
    };
  }

  refreshActivityPulse(): void {
    const now = this.getNow();
    this.lastActivityPulse$.next(now);
    localStorage.setItem(this.STORAGE_KEY, now.toString());
  }

  registerUserActivity(): void {
    this.refreshActivityPulse();
    this.activitySync$.next();
  }

  constructor(
    private appService: AppService,
    private backendService: BackendService
  ) {
    // Listen for activity in other tabs
    window.addEventListener('storage', event => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        const remotePulse = parseInt(event.newValue, 10);
        if (remotePulse > this.lastActivityPulse$.value) {
          this.lastActivityPulse$.next(remotePulse);
        }
      }
    });

    // Check for existing pulse on startup
    const existingPulse = localStorage.getItem(this.STORAGE_KEY);
    if (existingPulse) {
      const pulse = parseInt(existingPulse, 10);
      if (this.getNow() - pulse < this.inactivityTimeoutMs) {
        this.lastActivityPulse$.next(pulse);
      }
    }

    // Reactively manage heartbeat lifecycle based on user session
    this.appService.authDataChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(authData => {
        if (authData.userId > 0) {
          this.start();
        } else {
          this.stop();
        }
      });

    // Initial check in case we are already logged in
    if (this.appService.authData?.userId > 0) {
      this.start();
    }

    // Gate on the login state instead of tearing the subscription down in stop():
    // a manual unsubscribe would leave auto-logout dead after logout + re-login.
    this.activityStatus$.pipe(
      filter(() => (this.appService.authData?.userId || 0) > 0),
      filter(status => status.activePercentage === 0 && status.passivePercentage <= 0),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.backendService.logout();
      // Delay redirect slightly so the user sees the fully depleted bar before redirect.
      setTimeout(() => this.redirectToHome(), AUTO_LOGOUT_REDIRECT_DELAY_MS);
    });

    this.activitySync$
      .pipe(
        throttleTime(ACTIVITY_SYNC_THROTTLE_MS),
        filter(() => (this.appService.authData?.userId || 0) > 0),
        switchMap(() => this.backendService.activity().pipe(
          catchError(() => of(null))
        )),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.ngZone.runOutsideAngular(() => {
      merge(
        fromEvent(window, 'mousemove', { passive: true }),
        fromEvent(window, 'keydown', { passive: true }),
        fromEvent(window, 'mousedown', { passive: true }),
        fromEvent(window, 'touchstart', { passive: true })
      ).pipe(
        throttleTime(USER_ACTIVITY_THROTTLE_MS),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(() => this.registerUserActivity());
    });

    this.appService.postMessage$
      .pipe(
        throttleTime(POST_MESSAGE_ACTIVITY_THROTTLE_MS),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(() => this.registerUserActivity());
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.refreshActivityPulse();
  }

  stop(): void {
    this.started = false;
  }

  // Own method so tests can observe the auto-logout redirect by stubbing it:
  // assigning window.location.href makes jsdom attempt a real navigation, which
  // it cannot do and reports as an "Not implemented: navigation" error.
  // eslint-disable-next-line class-methods-use-this
  private redirectToHome(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/home';
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
