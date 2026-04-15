import { TestBed, fakeAsync, tick } from '@angular/core/testing';
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

const { location } = window;

describe('HeartbeatService', () => {
  let service: HeartbeatService;
  let backendServiceMock: DeepMocked<BackendService>;
  let appServiceMock: DeepMocked<AppService>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    backendServiceMock = createMock<BackendService>({
      ping: jest.fn().mockReturnValue(of(true))
    });
    appServiceMock = createMock<AppService>({
      authDataChanged: new Subject<AuthDataDto>(),
      postMessage$: new Subject<MessageEvent>()
    });

    delete (window as Partial<Window>).location;
    (window as unknown as { location: Partial<Location> }).location = {
      href: 'http://localhost/home',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: () => 'http://localhost/home'
    };

    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
    jest.clearAllMocks();
    jest.useRealTimers();
    (window as unknown as { location: Location }).location = location;
  });

  it('should be created', () => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    expect(service).toBeTruthy();
  });

  it('should start pinging when user and app are active', fakeAsync(() => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
  }));

  it('should not ping when app is hidden', fakeAsync(() => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  }));

  it('should stop pinging when user is idle', fakeAsync(() => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceMock.ping).toHaveBeenCalled();

    // Switch to idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 1000);
    backendServiceMock.ping.mockClear();

    // After being idle, no more pings should happen
    tick(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  }));

  it('should resume pinging upon user interaction', fakeAsync(() => {
    appServiceMock.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();

    // Become idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    // Simulated activity
    service.refreshActivityPulse();
    tick(HEARTBEAT_PING_INTERVAL_MS + 10000); // Wait for heartbeat poll

    expect(backendServiceMock.ping).toHaveBeenCalled();
  }));

  it('should not start if no user is logged in', fakeAsync(() => {
    appServiceMock.authData = { userId: 0 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceMock.ping).not.toHaveBeenCalled();
  }));
});

describe('HeartbeatService Iframe Extension', () => {
  let service: HeartbeatService;
  let backendServiceMock: DeepMocked<BackendService>;
  let appServiceMock: DeepMocked<AppService>;

  beforeEach(() => {
    localStorage.clear();
    backendServiceMock = createMock<BackendService>({
      ping: jest.fn().mockReturnValue(of(true))
    });
    appServiceMock = createMock<AppService>({
      authData: { userId: 1 } as AuthDataDto,
      authDataChanged: new Subject<AuthDataDto>(),
      postMessage$: new Subject<MessageEvent>()
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
    }
    jest.useRealTimers();
  });

  it('should refresh pulse when a postMessage is received', fakeAsync(() => {
    // Become idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    // Trigger postMessage
    appServiceMock.postMessage$.next({ data: { type: 'some-message' } } as MessageEvent);
    tick(1500); // Trigger throttled logic
    tick(HEARTBEAT_PING_INTERVAL_MS + 10000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
  }));

  it('should refresh pulse when refreshActivityPulse is called', fakeAsync(() => {
    // Become idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceMock.ping.mockClear();

    service.refreshActivityPulse();

    tick(1500);
    tick(HEARTBEAT_PING_INTERVAL_MS + 10000);

    expect(backendServiceMock.ping).toHaveBeenCalled();
  }));
});
