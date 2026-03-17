import { Injectable, OnDestroy } from '@angular/core';
import {
  interval, Subscription, of, BehaviorSubject, timer, Subject, combineLatest, asapScheduler
} from 'rxjs';
import {
  switchMap, filter, distinctUntilChanged, startWith, map, catchError, shareReplay, takeUntil, observeOn
} from 'rxjs/operators';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS, HEARTBEAT_PING_INTERVAL_MS, UI_BAR_REFRESH_INTERVAL_MS
} from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private heartbeatSubscription: Subscription | null = null;
  private readonly intervalMs = HEARTBEAT_PING_INTERVAL_MS;
  private readonly pollIntervalMs = UI_BAR_REFRESH_INTERVAL_MS;
  private readonly activityThresholdMs = ACTIVE_THRESHOLD_MS;
  private readonly passiveThresholdMs = PASSIVE_THRESHOLD_MS;

  private readonly lastActivityPulse$ = new BehaviorSubject<number>(Date.now());
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly STORAGE_KEY = 'st_activity_pulse';

  readonly activityStatus$ = timer(0, UI_BAR_REFRESH_INTERVAL_MS).pipe(
    observeOn(asapScheduler),
    switchMap(() => this.lastActivityPulse$),
    map(lastPulse => {
      const now = Date.now();
      const diff = now - lastPulse;

      const isPhase1Value = diff <= this.activityThresholdMs;

      if (isPhase1Value) {
        const activeP = ((this.activityThresholdMs - diff) / this.activityThresholdMs) * 100;
        return {
          activePercentage: Math.max(0, Math.round(activeP * 100) / 100),
          passivePercentage: 100
        };
      }

      const passiveDiff = diff - this.activityThresholdMs;
      const passiveP = ((this.passiveThresholdMs - passiveDiff) / this.passiveThresholdMs) * 100;

      return {
        activePercentage: 0,
        passivePercentage: Math.max(0, Math.round(passiveP * 100) / 100)
      };
    }),
    distinctUntilChanged((prev, curr) => prev.activePercentage === curr.activePercentage &&
      prev.passivePercentage === curr.passivePercentage),
    shareReplay(1)
  );

  private autoLogoutSubscription: Subscription | null = null;

  refreshActivityPulse(): void {
    const now = Date.now();
    this.lastActivityPulse$.next(now);
    localStorage.setItem(this.STORAGE_KEY, now.toString());
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
      if (Date.now() - pulse < (this.activityThresholdMs + this.passiveThresholdMs)) {
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
      // Delay redirect slightly to allow the final 5s CSS transition to reach 0% if needed
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/home';
        }
      }, 1000);
    });

    // Restore activity tracking for DOM events (mouse, keyboard) with throttling
    // to avoid excessive localStorage writes
    let lastInteractionRefresh = 0;
    ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(eventName => {
      window.addEventListener(eventName, () => {
        const now = Date.now();
        if (now - lastInteractionRefresh > 1000) { // Throttle to once per second
          lastInteractionRefresh = now;
          this.refreshActivityPulse();
        }
      });
    });
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
        const now = Date.now();
        const authId = (authData as AuthDataDto)?.userId || 0;
        return {
          isVisible: typeof document !== 'undefined' && document.visibilityState === 'visible',
          isNotIdle: (now - pulse) < this.activityThresholdMs + this.passiveThresholdMs,
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
