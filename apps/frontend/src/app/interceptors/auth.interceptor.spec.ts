import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpContext,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AppHttpError } from '../classes/app-http-error.class';
import { AuthInterceptor } from './auth.interceptor';
import {
  authRequestContext, backgroundRequestContext, logoutContext, tokenRefreshContext
} from './request-classification';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let appServiceSpy: { addErrorMessage: jest.Mock, serverTimeOffset: number };
  let backendServiceSpy: { refresh: jest.Mock, logout: jest.Mock };
  let routerSpy: { navigate: jest.Mock };

  beforeEach(() => {
    appServiceSpy = {
      addErrorMessage: jest.fn(),
      serverTimeOffset: 0
    };
    backendServiceSpy = {
      refresh: jest.fn(),
      logout: jest.fn()
    };
    routerSpy = {
      navigate: jest.fn().mockResolvedValue(true)
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
    // The interceptor coordinates refreshes across tabs through localStorage; leaving
    // either key behind makes the next test take the "another tab is refreshing" branch.
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('st_refresh_lock');
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

  it('updates the server time offset when the Date header shows real clock skew', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000000);

    httpClient.get('/skewed').subscribe();
    const req = httpMock.expectOne('/skewed');
    req.flush({}, { headers: { Date: new Date(1000000 + 60000).toUTCString() } });

    expect(appServiceSpy.serverTimeOffset).toBe(60000);
    nowSpy.mockRestore();
  });

  it('ignores Date header changes within the jitter deadband', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000000);
    appServiceSpy.serverTimeOffset = 60000;

    httpClient.get('/jitter').subscribe();
    const req = httpMock.expectOne('/jitter');
    req.flush({}, { headers: { Date: new Date(1000000 + 61000).toUTCString() } });

    expect(appServiceSpy.serverTimeOffset).toBe(60000);
    nowSpy.mockRestore();
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

  // A refresh that worked says the session is fine. If the repeated request still fails, that
  // failure belongs to the request, not to the session: the API answers missing workspace access
  // with 401 as well, and opening a unit in a foreign workspace used to log the user out (#1694).
  describe('when the refresh succeeds but the repeated request fails', () => {
    // A 401 that outlives a fresh token cannot mean "not logged in", so it is shown as the
    // missing permission it is; any other status is shown as it came.
    [
      {
        status: 401, statusText: 'Unauthorized', shownAs: 403, reason: 'no access to the workspace'
      },
      {
        status: 500, statusText: 'Server Error', shownAs: 500, reason: 'an unrelated server error'
      }
    ].forEach(({
      status, statusText, shownAs, reason
    }) => {
      it(`should keep the session, hand the ${status} to the caller and show a ${shownAs} (${reason})`, () => {
        localStorage.setItem('refresh_token', 'old-refresh');
        backendServiceSpy.refresh.mockReturnValue(of({ accessToken: 'new-access', refreshToken: 'new-refresh' }));
        let receivedStatus: number | undefined;

        httpClient.get('/data').subscribe({ error: err => { receivedStatus = err.status; } });
        httpMock.expectOne('/data').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        httpMock.expectOne('/data').flush('failed again', { status, statusText });

        expect(backendServiceSpy.refresh).toHaveBeenCalledTimes(1);
        expect(backendServiceSpy.logout).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        expect(receivedStatus).toBe(status);
        expect(localStorage.getItem('id_token')).toBe('new-access');
        expect(appServiceSpy.addErrorMessage).toHaveBeenCalledTimes(1);
        const shown = appServiceSpy.addErrorMessage.mock.calls[0][0] as AppHttpError;
        expect(shown.status).toBe(shownAs);
        expect(shown.method).toBe('GET');
        expect(shown.urlWithParams).toBe('/data');
      });
    });

    // Several requests fail at once when a page opens. Only the first refreshes; the others wait
    // for its token and are repeated from a different branch, which has to behave the same.
    it('should keep the session for a request that waited for the refresh of another', () => {
      localStorage.setItem('refresh_token', 'old-refresh');
      const refresh$ = new Subject<{ accessToken: string, refreshToken: string }>();
      backendServiceSpy.refresh.mockReturnValue(refresh$);

      httpClient.get('/first').subscribe({ error: () => {} });
      httpClient.get('/second').subscribe({ error: () => {} });
      httpMock.expectOne('/first').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/second').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      refresh$.next({ accessToken: 'new-access', refreshToken: 'new-refresh' });
      refresh$.complete();
      httpMock.expectOne('/first').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/second').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(backendServiceSpy.refresh).toHaveBeenCalledTimes(1);
      expect(backendServiceSpy.logout).not.toHaveBeenCalled();
      expect(appServiceSpy.addErrorMessage).toHaveBeenCalledTimes(2);
      appServiceSpy.addErrorMessage.mock.calls
        .forEach(([shown]: [AppHttpError]) => expect(shown.status).toBe(403));
    });

    // Another tab holds the lock and hands over its token through a storage event. If the request
    // then still fails, that is the request's doing -- falling back to a refresh of our own would
    // only rotate the token again and send the same request a third time.
    it('should not refresh on its own when the token of another tab does not help either', () => {
      localStorage.setItem('id_token', 'old-access');
      localStorage.setItem('refresh_token', 'old-refresh');
      localStorage.setItem('st_refresh_lock', Date.now().toString());

      httpClient.get('/data').subscribe({ error: () => {} });
      httpMock.expectOne('/data').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      window.dispatchEvent(new StorageEvent('storage', { key: 'id_token', newValue: 'other-tab-access' }));
      const repeated = httpMock.expectOne('/data');
      expect(repeated.request.headers.get('Authorization')).toBe('Bearer other-tab-access');
      repeated.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(backendServiceSpy.refresh).not.toHaveBeenCalled();
      expect(backendServiceSpy.logout).not.toHaveBeenCalled();
      expect(appServiceSpy.addErrorMessage).toHaveBeenCalledTimes(1);
      expect((appServiceSpy.addErrorMessage.mock.calls[0][0] as AppHttpError).status).toBe(403);
    });
  });

  // The classification comes from the call site, not from the URL. Every case below uses
  // the same neutral URL on purpose: a URL-matching interceptor would have to fail these.
  describe('request classification', () => {
    const expire = (context?: HttpContext): void => {
      httpClient.post('/neutral', {}, context ? { context } : {}).subscribe({ error: () => {} });
      httpMock.expectOne('/neutral').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    };

    it('should refresh the token for an unmarked request that expires', () => {
      localStorage.setItem('refresh_token', 'old-refresh');
      backendServiceSpy.refresh.mockReturnValue(of(null));

      expire();

      expect(backendServiceSpy.refresh).toHaveBeenCalled();
    });

    // A background request is not exempt from the refresh: the liveness ping runs on a
    // timer past the access token's lifetime, and its 401 is exactly what has to renew it.
    it('should refresh the token for a background request that expires', () => {
      localStorage.setItem('refresh_token', 'old-refresh');
      backendServiceSpy.refresh.mockReturnValue(of({ accessToken: 'new', refreshToken: 'new-r' }));

      httpClient.post('/neutral', {}, { context: backgroundRequestContext() }).subscribe();
      httpMock.expectOne('/neutral').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(backendServiceSpy.refresh).toHaveBeenCalled();
      httpMock.expectOne('/neutral').flush({});
      expect(appServiceSpy.addErrorMessage).not.toHaveBeenCalled();
    });

    // Errors other than 401 are faults, not expiry, and stay visible.
    it('should report a background request that fails for another reason', () => {
      httpClient.post('/neutral', {}, { context: backgroundRequestContext() })
        .subscribe({ error: () => {} });

      httpMock.expectOne('/neutral').flush('boom', { status: 500, statusText: 'Server Error' });

      expect(appServiceSpy.addErrorMessage).toHaveBeenCalled();
    });

    it('should not try to refresh a token for an auth request', () => {
      localStorage.setItem('refresh_token', 'old-refresh');

      expire(authRequestContext());

      expect(backendServiceSpy.refresh).not.toHaveBeenCalled();
      // A rejected login is a real answer, so the user has to see it.
      expect(appServiceSpy.addErrorMessage).toHaveBeenCalled();
    });

    // Both flags together are the only combination the 401 suppression can reach: the
    // request skips the refresh, so it falls through to the error path, and being
    // unattended it must not raise a message there.
    it('should neither refresh nor report for the token refresh itself', () => {
      localStorage.setItem('refresh_token', 'old-refresh');

      expire(tokenRefreshContext());

      expect(backendServiceSpy.refresh).not.toHaveBeenCalled();
      expect(appServiceSpy.addErrorMessage).not.toHaveBeenCalled();
    });

    it('should neither refresh nor report for a logout', () => {
      localStorage.setItem('refresh_token', 'old-refresh');

      expire(logoutContext());

      expect(backendServiceSpy.refresh).not.toHaveBeenCalled();
      expect(appServiceSpy.addErrorMessage).not.toHaveBeenCalled();
    });
  });
});
