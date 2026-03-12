import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { HeartbeatService } from './heartbeat.service';
import { AppService } from './app.service';
import { BackendService } from './backend.service';

describe('HeartbeatService', () => {
  let service: HeartbeatService;
  let backendServiceSpy: { ping: jest.Mock };
  let appServiceSpy: { authData: { userId: number } | null };

  beforeEach(() => {
    backendServiceSpy = {
      ping: jest.fn().mockReturnValue(of(true))
    };
    appServiceSpy = {
      authData: { userId: 1 }
    };

    TestBed.configureTestingModule({
      providers: [
        HeartbeatService,
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: AppService, useValue: appServiceSpy }
      ]
    });

    service = TestBed.inject(HeartbeatService);
  });

  afterEach(() => {
    service.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start pinging when user and app are active', fakeAsync(() => {
    service.start();
    tick(60001); // 1 minute interval

    expect(backendServiceSpy.ping).toHaveBeenCalled();
  }));

  it('should not ping when app is hidden', fakeAsync(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    service.start();
    tick(60001);

    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));

  it('should stop pinging when user is idle', fakeAsync(() => {
    service.start();
    tick(30000); // 30s
    expect(backendServiceSpy.ping).not.toHaveBeenCalled();

    // No interaction happens...
    tick(300001); // 5 minutes idle timeout
    tick(60001); // 1 minute heartbeat interval

    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));

  it('should resume pinging upon user interaction', fakeAsync(() => {
    service.start();

    // Become idle
    tick(300001);
    backendServiceSpy.ping.mockClear();

    // Simulate interaction
    window.dispatchEvent(new Event('mousemove'));
    tick(0); // Trigger throttleTime/switchMap logic
    tick(61000); // 1 minute heartbeat interval

    expect(backendServiceSpy.ping).toHaveBeenCalled();
  }));

  it('should not start if no user is logged in', fakeAsync(() => {
    appServiceSpy.authData = null;
    service.start();
    tick(60001);

    expect(backendServiceSpy.ping).not.toHaveBeenCalled();
  }));
});
