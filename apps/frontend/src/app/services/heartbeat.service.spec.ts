import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
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
  let backendServiceSpy: { ping: jest.Mock; logout: jest.Mock };
  let appServiceSpy: { authData: AuthDataDto | null, authDataChanged: Subject<AuthDataDto> };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    backendServiceSpy = {
      ping: jest.fn().mockReturnValue(of(true)),
      logout: jest.fn()
    };
    appServiceSpy = {
      authData: null,
      authDataChanged: new Subject<AuthDataDto>()
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    window.location = {
      href: 'http://localhost/home',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: () => 'http://localhost/home'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
    jest.clearAllMocks();
    jest.useRealTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = location;
  });

  it('should be created', () => {
    appServiceSpy.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    expect(service).toBeTruthy();
  });

  it('should start pinging when user and app are active', fakeAsync(() => {
    appServiceSpy.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceSpy.ping).toHaveBeenCalled();
  }));

  it('should not ping when app is hidden', fakeAsync(() => {
    appServiceSpy.authData = { userId: 1 } as AuthDataDto;
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));

  it('should stop pinging when user is idle', fakeAsync(() => {
    appServiceSpy.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceSpy.ping).toHaveBeenCalled();

    // Switch to idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 1000);
    backendServiceSpy.ping.mockClear();

    // After being idle, no more pings should happen
    tick(HEARTBEAT_PING_INTERVAL_MS * 2);
    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));

  it('should resume pinging upon user interaction', fakeAsync(() => {
    appServiceSpy.authData = { userId: 1 } as AuthDataDto;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();

    // Become idle
    tick(ACTIVE_THRESHOLD_MS + PASSIVE_THRESHOLD_MS + 10000);
    backendServiceSpy.ping.mockClear();

    // Simulate interaction
    window.dispatchEvent(new Event('mousemove'));
    tick(1500); // Trigger throttled logic (throttle is 1000ms)
    tick(HEARTBEAT_PING_INTERVAL_MS + 10000); // Wait for heartbeat poll

    expect(backendServiceSpy.ping).toHaveBeenCalled();
  }));

  it('should not start if no user is logged in', fakeAsync(() => {
    appServiceSpy.authData = null;
    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });
    service = TestBed.inject(HeartbeatService);
    service.start();
    tick(HEARTBEAT_PING_INTERVAL_MS + 1000);

    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));
});
