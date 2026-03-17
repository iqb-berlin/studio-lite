import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AppHttpError } from '../classes/app-http-error.class';
import { HeartbeatService } from '../services/heartbeat.service';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let appServiceSpy: { addErrorMessage: jest.Mock };
  let backendServiceSpy: { refresh: jest.Mock, logout: jest.Mock };
  let routerSpy: { navigate: jest.Mock };
  let heartbeatServiceSpy: { refreshActivityPulse: jest.Mock };

  beforeEach(() => {
    appServiceSpy = {
      addErrorMessage: jest.fn()
    };
    backendServiceSpy = {
      refresh: jest.fn(),
      logout: jest.fn()
    };
    routerSpy = {
      navigate: jest.fn().mockResolvedValue(true)
    };
    heartbeatServiceSpy = {
      refreshActivityPulse: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: AppService,
          useValue: appServiceSpy as Partial<AppService>
        },
        {
          provide: BackendService,
          useValue: backendServiceSpy
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: HeartbeatService,
          useValue: heartbeatServiceSpy
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.removeItem('id_token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('id_token');
    jest.clearAllMocks();
  });

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('adds Authorization and app-version headers when token exists', () => {
    localStorage.setItem('id_token', 'token-123');

    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    expect(req.request.headers.get('app-version')).toBe('0.0.0');
    req.flush({});
  });

  it('adds only app-version header when token does not exist', () => {
    httpClient.get('/test-no-token').subscribe();

    const req = httpMock.expectOne('/test-no-token');
    expect(req.request.headers.get('Authorization')).toBeNull();
    expect(req.request.headers.get('app-version')).toBe('0.0.0');
    req.flush({});
  });

  it('reports errors with method and url on error responses', () => {
    httpClient.get('/boom').subscribe({
      error: () => {
        // error is expected
      }
    });

    const req = httpMock.expectOne('/boom');
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(appServiceSpy.addErrorMessage).toHaveBeenCalled();
    const errorArg = appServiceSpy.addErrorMessage.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(AppHttpError);
    expect(errorArg.method).toBe('GET');
    expect(errorArg.urlWithParams).toBe('/boom');
  });

  it('should attempt to refresh token on 401 error', () => {
    localStorage.setItem('refresh_token', 'old-refresh');

    backendServiceSpy.refresh.mockReturnValue(of({ accessToken: 'new-aceess', refreshToken: 'new-refresh' }));

    httpClient.get('/data').subscribe();
    const reqs = httpMock.match('/data');
    expect(reqs.length).toBe(1);
    reqs[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(backendServiceSpy.refresh).toHaveBeenCalledWith('old-refresh');

    // Should retry the request with new token
    const retryReqs = httpMock.match('/data');
    expect(retryReqs.length).toBe(1);
    expect(retryReqs[0].request.headers.get('Authorization')).toBe('Bearer new-aceess');
    retryReqs[0].flush({});
  });

  it('should logout and redirect to login if refresh fails', () => {
    localStorage.setItem('refresh_token', 'old-refresh');
    backendServiceSpy.refresh.mockReturnValue(throwError(() => new Error('Refresh expired')));

    httpClient.get('/data').subscribe({ error: () => {} });
    const reqs = httpMock.match('/data');
    expect(reqs.length).toBe(1);
    reqs[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(backendServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
