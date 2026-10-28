import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
import { AppService } from './app.service';
import { IS_BACKGROUND_REQUEST, SKIP_TOKEN_REFRESH } from '../interceptors/request-classification';

describe('BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  let appService: jest.Mocked<AppService>;
  const serverUrl = 'http://test-server/api/';

  beforeEach(() => {
    const appServiceMock = {
      authData: AppService.defaultAuthData
    };

    TestBed.configureTestingModule({
      providers: [
        BackendService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'SERVER_URL', useValue: serverUrl },
        { provide: AppService, useValue: appServiceMock }
      ]
    });

    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
    appService = TestBed.inject(AppService) as jest.Mocked<AppService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', done => {
      const mockLoginResponse = { accessToken: 'test-token-123', refreshToken: 'refresh-token-123' };
      const mockAuthData: AuthDataDto = {
        userId: 1,
        userName: 'testUser',
        userLongName: 'Test User',
        isAdmin: false,
        workspaces: [],
        reviews: []
      };

      service.login('testUser', 'password', false).subscribe(result => {
        expect(result).toBe(true);
        expect(localStorage.getItem('id_token')).toBe(mockLoginResponse.accessToken);
        expect(localStorage.getItem('refresh_token')).toBe(mockLoginResponse.refreshToken);
        expect(appService.authData).toEqual(mockAuthData);
        done();
      });

      const loginReq = httpMock.expectOne(`${serverUrl}login`);
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual({
        username: 'testUser',
        password: 'password'
      });
      loginReq.flush(mockLoginResponse);

      const authReq = httpMock.expectOne(`${serverUrl}auth-data`);
      expect(authReq.request.method).toBe('GET');
      authReq.flush(mockAuthData);
    });

    it('should use init-login endpoint when initLoginMode is true', done => {
      const mockLoginResponse = { accessToken: 'init-token', refreshToken: 'init-refresh' };
      const mockAuthData: AuthDataDto = {
        userId: 1,
        userName: 'admin',
        userLongName: 'Admin User',
        isAdmin: true,
        workspaces: [],
        reviews: []
      };

      service.login('admin', 'password', true).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const loginReq = httpMock.expectOne(`${serverUrl}init-login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(mockLoginResponse);

      const authReq = httpMock.expectOne(`${serverUrl}auth-data`);
      authReq.flush(mockAuthData);
    });

    it('should return false on login failure', done => {
      service.login('wrongUser', 'wrongPassword', false).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}login`);
      req.error(new ProgressEvent('error'));
    });

    it('should return false when auth-data fails after successful login', done => {
      const mockLoginResponse = { accessToken: 'test-token', refreshToken: 'test-refresh' };

      service.login('testUser', 'password', false).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const loginReq = httpMock.expectOne(`${serverUrl}login`);
      loginReq.flush(mockLoginResponse);

      const authReq = httpMock.expectOne(`${serverUrl}auth-data`);
      authReq.error(new ProgressEvent('error'));
    });
  });

  describe('logout', () => {
    it('should remove tokens from localStorage', () => {
      localStorage.setItem('id_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      service.logout();
      const req = httpMock.expectOne(`${serverUrl}logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      expect(localStorage.getItem('id_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should reset authData to default', () => {
      appService.authData = {
        userId: 1,
        userName: 'testUser',
        userLongName: 'Test User',
        isAdmin: true,
        workspaces: [],
        reviews: []
      };

      service.logout();
      const req = httpMock.expectOne(`${serverUrl}logout`);
      req.flush(null);
      expect(appService.authData).toEqual(AppService.defaultAuthData);
    });

    it('should try logout-silent when logout returns an error', () => {
      localStorage.setItem('id_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');

      service.logout();

      const logoutReq = httpMock.expectOne(`${serverUrl}logout`);
      expect(logoutReq.request.method).toBe('POST');
      logoutReq.error(new ProgressEvent('error'));

      const silentReq = httpMock.expectOne(`${serverUrl}logout-silent`);
      expect(silentReq.request.method).toBe('POST');
      expect(silentReq.request.body).toEqual({ refreshToken: 'test-refresh' });
      silentReq.flush(null);
    });
  });

  describe('getAppLogo', () => {
    // A null would read as "no logo stored", and the admin form would offer an empty one for saving (#1969).
    it('should answer a failed request with false', done => {
      service.getAppLogo().subscribe(logo => {
        expect(logo).toBe(false);
        done();
      });

      httpMock.expectOne(`${serverUrl}admin/settings/app-logo`).error(new ProgressEvent('error'));
    });
  });

  describe('getConfig', () => {
    it('should return default config on error', done => {
      service.getConfig().subscribe(config => {
        expect(config?.appTitle).toBe('IQB-Studio');
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/config`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setUserPassword', () => {
    it('should update password successfully', done => {
      service.setUserPassword('oldPass', 'newPass').subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}password`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        oldPassword: 'oldPass',
        newPassword: 'newPass'
      });
      req.flush(true);
    });
  });

  // The interceptor reads these from the request context; guessing them from the URL is
  // what #1517 removed. A method that forgets to declare itself is the failure mode, so
  // each background and auth call is pinned here.
  describe('request classification at the call site', () => {
    it('should mark the activity sync as a background request', done => {
      service.activity().subscribe(() => done());

      const req = httpMock.expectOne(`${serverUrl}activity`);
      expect(req.request.context.get(IS_BACKGROUND_REQUEST)).toBe(true);
      expect(req.request.context.get(SKIP_TOKEN_REFRESH)).toBe(false);
      req.flush(null);
    });

    it('should keep the login out of the token refresh', () => {
      service.login('user', 'pw', false).subscribe();

      const req = httpMock.expectOne(`${serverUrl}login`);
      expect(req.request.context.get(SKIP_TOKEN_REFRESH)).toBe(true);
      req.flush({ accessToken: 'a', refreshToken: 'r' });
      httpMock.expectOne(`${serverUrl}auth-data`).flush({});
    });

    it('should keep the token refresh out of the token refresh', () => {
      service.refresh('old').subscribe();

      const req = httpMock.expectOne(`${serverUrl}refresh`);
      expect(req.request.context.get(SKIP_TOKEN_REFRESH)).toBe(true);
      expect(req.request.context.get(IS_BACKGROUND_REQUEST)).toBe(true);
      req.flush({ accessToken: 'a', refreshToken: 'r' });
    });

    it('should mark the logout as background and refresh-free', () => {
      localStorage.setItem('refresh_token', 'r');

      service.logout();

      const req = httpMock.expectOne(`${serverUrl}logout`);
      expect(req.request.context.get(IS_BACKGROUND_REQUEST)).toBe(true);
      expect(req.request.context.get(SKIP_TOKEN_REFRESH)).toBe(true);
      req.flush(null);
    });
  });
});
