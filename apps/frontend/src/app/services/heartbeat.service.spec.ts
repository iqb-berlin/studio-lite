import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { HeartbeatService } from './heartbeat.service';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS, ACTIVITY_SYNC_THROTTLE_MS, AUTO_LOGOUT_REDIRECT_DELAY_MS,
  SESSION_PING_INTERVAL_MS
} from '../app.constants';

jest.mock('../app.constants', () => ({
  ACTIVE_THRESHOLD_MS: 30000,
  PASSIVE_THRESHOLD_MS: 60000,
  UI_BAR_REFRESH_INTERVAL_MS: 1000,
  ADMIN_USER_LIST_POLL_INTERVAL_MS: 1000,
  ACTIVITY_SYNC_THROTTLE_MS: 5000,
  USER_ACTIVITY_THROTTLE_MS: 1000,
  POST_MESSAGE_ACTIVITY_THROTTLE_MS: 1000,
  AUTO_LOGOUT_REDIRECT_DELAY_MS: 1000,
  SESSION_PING_INTERVAL_MS: 10000
}));

describe('HeartbeatService', () => {
  let service: HeartbeatService;
  let backendServiceMock: DeepMocked<BackendService>;
  let appServiceMock: DeepMocked<AppService>;
  let postMessage$: Subject<MessageEvent>;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();

    postMessage$ = new Subject<MessageEvent>();
    backendServiceMock = createMock<BackendService>({
      activity: jest.fn().mockReturnValue(of(true)),
      sessionPing: jest.fn().mockReturnValue(of(undefined)),
      logout: jest.fn()
    });
    appServiceMock = createMock<AppService>({
      authDataChanged: new Subject<AuthDataDto>(),
      postMessage$: postMessage$,
      getServerTime: jest.fn(() => Date.now())
    });
  });

  const configureTestingModule = (): void => {
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
  };

  // The real implementation assigns window.location.href, which jsdom cannot
  // perform and reports as an "Not implemented: navigation" error.
  const stubRedirect = (): jest.SpyInstance => jest
    .spyOn(service as unknown as { redirectToHome: () => void }, 'redirectToHome')
    .mockImplementation();

  afterEach(() => {
    if (service) {
      service.stop();
      service.ngOnDestroy();
    }
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be created', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    expect(service).toBeTruthy();
  });

  it('should sync user activity to the backend', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();

    service.registerUserActivity();
    jest.advanceTimersByTime(100);

    expect(backendServiceMock.activity).toHaveBeenCalled();
  });

  it('should throttle activity syncs to the backend', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();

    service.registerUserActivity();
    jest.advanceTimersByTime(100);
    service.registerUserActivity();
    jest.advanceTimersByTime(100);

    expect(backendServiceMock.activity).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ACTIVITY_SYNC_THROTTLE_MS);
    service.registerUserActivity();
    jest.advanceTimersByTime(100);

    expect(backendServiceMock.activity).toHaveBeenCalledTimes(2);
  });

  it('should not sync activity when no user is logged in', () => {
    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);

    service.registerUserActivity();
    jest.advanceTimersByTime(100);

    expect(backendServiceMock.activity).not.toHaveBeenCalled();
  });

  // The ping is what tells the backend a tab still exists. It must not depend on user
  // interaction, otherwise an open but idle tab is indistinguishable from a closed one.
  it('should ping the session on its own interval without any user interaction', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);

    jest.advanceTimersByTime(100);
    expect(backendServiceMock.sessionPing).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(SESSION_PING_INTERVAL_MS);
    expect(backendServiceMock.sessionPing).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(SESSION_PING_INTERVAL_MS);
    expect(backendServiceMock.sessionPing).toHaveBeenCalledTimes(3);

    expect(backendServiceMock.activity).not.toHaveBeenCalled();
  });

  it('should not ping the session when no user is logged in', () => {
    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);

    jest.advanceTimersByTime(SESSION_PING_INTERVAL_MS * 3);

    expect(backendServiceMock.sessionPing).not.toHaveBeenCalled();
  });

  it('should keep pinging after a failed ping', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    backendServiceMock.sessionPing = jest.fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValue(of(undefined));
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);

    jest.advanceTimersByTime(100);
    jest.advanceTimersByTime(SESSION_PING_INTERVAL_MS);

    expect(backendServiceMock.sessionPing).toHaveBeenCalledTimes(2);
  });

  it('should refresh the pulse when a postMessage is received', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();

    postMessage$.next({ data: { type: 'some-message' } } as MessageEvent);
    jest.advanceTimersByTime(1500);

    expect(backendServiceMock.activity).toHaveBeenCalled();
  });

  it('should log out when active and passive phases are depleted', async () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    const redirectSpy = stubRedirect();
    service.start();

    await jest.advanceTimersByTimeAsync(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 2000);

    expect(backendServiceMock.logout).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalled();
  });

  it('should redirect only after the configured delay', async () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    const redirectSpy = stubRedirect();
    service.start();

    // PASSIVE_THRESHOLD_MS is the total inactivity timeout, so the phases are
    // depleted here; stop short of the redirect delay that starts at that point.
    await jest.advanceTimersByTimeAsync(PASSIVE_THRESHOLD_MS + AUTO_LOGOUT_REDIRECT_DELAY_MS / 2);

    expect(backendServiceMock.logout).toHaveBeenCalled();
    expect(redirectSpy).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(AUTO_LOGOUT_REDIRECT_DELAY_MS);

    expect(redirectSpy).toHaveBeenCalled();
  });

  it('should not log out while no user is logged in', async () => {
    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);

    await jest.advanceTimersByTimeAsync(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 2000);

    expect(backendServiceMock.logout).not.toHaveBeenCalled();
  });

  it('should still log out after a logout and re-login in the same tab', async () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    stubRedirect();
    service.start();

    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    (appServiceMock.authDataChanged as Subject<AuthDataDto>).next({ userId: 0 } as AuthDataDto);
    await jest.advanceTimersByTimeAsync(1000);

    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    (appServiceMock.authDataChanged as Subject<AuthDataDto>).next({ userId: 1 } as AuthDataDto);
    await jest.advanceTimersByTimeAsync(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 2000);

    expect(backendServiceMock.logout).toHaveBeenCalled();
  });

  it('should not log out while activity keeps the pulse fresh', async () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();

    await jest.advanceTimersByTimeAsync(ACTIVE_THRESHOLD_MS);
    service.refreshActivityPulse();
    await jest.advanceTimersByTimeAsync(ACTIVE_THRESHOLD_MS);

    expect(backendServiceMock.logout).not.toHaveBeenCalled();
  });
});
