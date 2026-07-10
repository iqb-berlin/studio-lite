import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { HeartbeatService } from './heartbeat.service';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS, ACTIVITY_SYNC_THROTTLE_MS
} from '../app.constants';

jest.mock('../app.constants', () => ({
  ACTIVE_THRESHOLD_MS: 30000,
  PASSIVE_THRESHOLD_MS: 60000,
  UI_BAR_REFRESH_INTERVAL_MS: 1000,
  ADMIN_USER_LIST_POLL_INTERVAL_MS: 1000,
  ACTIVITY_SYNC_THROTTLE_MS: 5000,
  USER_ACTIVITY_THROTTLE_MS: 1000,
  POST_MESSAGE_ACTIVITY_THROTTLE_MS: 1000,
  AUTO_LOGOUT_REDIRECT_DELAY_MS: 1000
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
    service.start();

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
