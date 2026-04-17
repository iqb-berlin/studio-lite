import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { HeartbeatService } from './heartbeat.service';
import { AppService } from './app.service';
import { BackendService } from './backend.service';
import {
  ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS, HEARTBEAT_PING_INTERVAL_MS
} from '../app.constants';

jest.mock('../app.constants', () => ({
  ACTIVE_THRESHOLD_MS: 30000,
  PASSIVE_THRESHOLD_MS: 60000,
  HEARTBEAT_PING_INTERVAL_MS: 10000,
  UI_BAR_REFRESH_INTERVAL_MS: 1000,
  ADMIN_USER_LIST_POLL_INTERVAL_MS: 1000
}));

describe('HeartbeatService', () => {
  let service: HeartbeatService;
  let backendServiceMock: DeepMocked<BackendService>;
  let appServiceMock: DeepMocked<AppService>;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();

    backendServiceMock = createMock<BackendService>({
      ping: jest.fn().mockReturnValue(of(true)),
      activity: jest.fn().mockReturnValue(of(true))
    });
    appServiceMock = createMock<AppService>({
      authDataChanged: new Subject<AuthDataDto>(),
      postMessage$: new Subject<MessageEvent>(),
      getServerTime: jest.fn(() => Date.now())
    });

    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
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

  it('should start pinging when user and app are active', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
  });

  it('should not ping when app is hidden', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  });

  it('should stop pinging when user is idle', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceMock.ping).toHaveBeenCalled();

    // Switch to idle
    jest.advanceTimersByTime(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 1000);
    backendServiceMock.ping.mockClear();

    // After being idle, no more pings should happen
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  });

  it('should resume pinging upon user interaction', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();

    // Become idle
    jest.advanceTimersByTime(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    // Simulated activity
    service.refreshActivityPulse();
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 10000); // Wait for heartbeat poll

    expect(backendServiceMock.ping).toHaveBeenCalled();
  });

  it('should not start if no user is logged in', () => {
    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    configureTestingModule();
    service = TestBed.inject(HeartbeatService);
    service.start();
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  });
});

describe('HeartbeatService Iframe Extension', () => {
  let service: HeartbeatService;
  let backendServiceMock: DeepMocked<BackendService>;
  let appServiceMock: DeepMocked<AppService>;
  let postMessage$: Subject<MessageEvent>;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    postMessage$ = new Subject<MessageEvent>();
    backendServiceMock = createMock<BackendService>({
      ping: jest.fn().mockReturnValue(of(true)),
      activity: jest.fn().mockReturnValue(of(true))
    });
    appServiceMock = createMock<AppService>({
      authData: { userId: 1 } as AuthDataDto,
      authDataChanged: new Subject<AuthDataDto>(),
      postMessage$: postMessage$,
      getServerTime: jest.fn(() => Date.now())
    });

    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
  });

  afterEach(() => {
    if (service) {
      service.stop();
      service.ngOnDestroy();
    }
    jest.useRealTimers();
  });

  it('should refresh pulse when a postMessage is received', () => {
    // Become idle
    jest.advanceTimersByTime(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    // Trigger postMessage
    postMessage$.next({ data: { type: 'some-message' } } as MessageEvent);
    jest.advanceTimersByTime(1500); // Trigger throttled logic
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 10000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
    expect(backendServiceMock.activity).toHaveBeenCalled();
  });

  it('should refresh pulse when refreshActivityPulse is called', () => {
    // Become idle
    jest.advanceTimersByTime(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    service.refreshActivityPulse();

    jest.advanceTimersByTime(1500);
    jest.advanceTimersByTime(HEARTBEAT_PING_INTERVAL_MS + 10000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
  });
});
