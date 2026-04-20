import {
  Injectable, NgZone, OnDestroy, inject
} from '@angular/core';
import {
  interval, Subscription, of, BehaviorSubject, timer, Subject, combineLatest, asapScheduler, merge, fromEvent
} from 'rxjs';
import {
  switchMap, filter, distinctUntilChanged, startWith, map, catchError, shareReplay, takeUntil, observeOn,
  throttleTime
} from 'rxjs/operators';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS,
  PASSIVE_THRESHOLD_MS,
  HEARTBEAT_PING_INTERVAL_MS,
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
  private heartbeatSubscription: Subscription | null = null;
  private readonly intervalMs = HEARTBEAT_PING_INTERVAL_MS;
  private readonly pollIntervalMs = UI_BAR_REFRESH_INTERVAL_MS;
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

  private autoLogoutSubscription: Subscription | null = null;

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

    this.autoLogoutSubscription = this.activityStatus$.pipe(
      filter(status => status.activePercentage === 0 && status.passivePercentage <= 0),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.backendService.logout();
      // Delay redirect slightly so the user sees the fully depleted bar before redirect.
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/home';
        }
      }, AUTO_LOGOUT_REDIRECT_DELAY_MS);
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
    if (this.heartbeatSubscription) {
      return;
    }

    this.refreshActivityPulse();

    // Reactively manage heartbeat lifecycle:
    // Ping every minute ONLY if:
    // 1. Tab is visible
    // 2. User is NOT idle (active or passive phase)
    // 3. User is logged in
    interface HeartbeatState {
      isVisible: boolean;
      isNotIdle: boolean;
      isLoggedIn: boolean;
    }

    const heartbeatTriggers$ = combineLatest([
      this.lastActivityPulse$,
      this.appService.authDataChanged.pipe(startWith(this.appService.authData)),
      interval(this.pollIntervalMs).pipe(startWith(0))
    ]).pipe(
      map(([pulse, authData]): HeartbeatState => {
        const now = this.getNow();
        const authId = (authData as AuthDataDto)?.userId || 0;
        return {
          isVisible: typeof document !== 'undefined' && document.visibilityState === 'visible',
          isNotIdle: (now - pulse) < this.inactivityTimeoutMs,
          isLoggedIn: authId > 0
        };
      }),
      distinctUntilChanged((prev: HeartbeatState, curr: HeartbeatState) => (
        prev.isVisible === curr.isVisible &&
        prev.isNotIdle === curr.isNotIdle &&
        prev.isLoggedIn === curr.isLoggedIn
      )),
      shareReplay(1)
    );

    this.heartbeatSubscription = heartbeatTriggers$.pipe(
      switchMap((state: HeartbeatState) => {
        if (state.isVisible && state.isNotIdle && state.isLoggedIn) {
          return interval(this.intervalMs).pipe(
            startWith(0),
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
    if (this.autoLogoutSubscription) {
      this.autoLogoutSubscription.unsubscribe();
      this.autoLogoutSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
