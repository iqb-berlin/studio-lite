import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppService } from '../services/app.service';
import { AppHttpError } from '../classes/app-http-error.class';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let appServiceSpy: { addErrorMessage: jest.Mock };

  beforeEach(() => {
    appServiceSpy = {
      addErrorMessage: jest.fn()
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
});
