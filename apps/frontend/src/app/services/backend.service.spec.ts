import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  AuthDataDto,
  MyDataDto,
  ConfigDto,
  AppLogoDto,
  ResourcePackageDto,
  WorkspaceFullDto,
  UserWorkspaceFullDto,
  WorkspaceSettingsDto,
  EmailTemplateDto
} from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
import { AppService } from './app.service';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
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

  describe('getAuthData', () => {
    it('should get auth data successfully', done => {
      const mockAuthData: AuthDataDto = {
        userId: 1,
        userName: 'testUser',
        userLongName: 'Test User',
        isAdmin: false,
        workspaces: [],
        reviews: []
      };

      service.getAuthData().subscribe(data => {
        expect(data).toEqual(mockAuthData);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}auth-data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuthData);
    });
  });

  describe('getMyData', () => {
    it('should get user data successfully', done => {
      const mockMyData: MyDataDto = {
        id: 1,
        description: 'Test Description',
        email: 'test@example.com',
        lastName: 'Doe',
        firstName: 'John',
        emailPublishApproved: true
      };

      service.getMyData().subscribe(data => {
        expect(data).toEqual(mockMyData);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}my-data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMyData);
    });

    it('should return null on error', done => {
      service.getMyData().subscribe(data => {
        expect(data).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}my-data`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setMyData', () => {
    it('should update user data successfully', done => {
      const newMyData: MyDataDto = {
        id: 1,
        description: 'Updated Description',
        email: 'updated@example.com',
        lastName: 'Smith',
        firstName: 'Jane',
        emailPublishApproved: false
      };

      service.setMyData(newMyData).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}my-data`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(newMyData);
      req.flush(true);
    });

    it('should return false on error', done => {
      const newMyData: MyDataDto = {
        id: 1,
        email: 'test@example.com'
      };

      service.setMyData(newMyData).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}my-data`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('logout', () => {
    it('should remove tokens from localStorage', () => {
      localStorage.setItem('id_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      service.logout();
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
      expect(appService.authData).toEqual(AppService.defaultAuthData);
    });
  });

  describe('getConfig', () => {
    it('should get config successfully', done => {
      const mockConfig: ConfigDto = {
        appTitle: 'Test Studio',
        introHtml: '<p>Test intro</p>',
        imprintHtml: '<p>Test imprint</p>',
        emailSubject: 'Test Subject',
        emailBody: 'Test Body',
        globalWarningText: 'Warning',
        globalWarningExpiredHour: 12,
        globalWarningExpiredDay: new Date('2024-12-31'),
        hasUsers: true
      };

      service.getConfig().subscribe(config => {
        expect(config).toEqual(mockConfig);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/config`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });

    it('should return default config on error', done => {
      service.getConfig().subscribe(config => {
        expect(config?.appTitle).toBe('IQB-Studio');
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/config`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getAppLogo', () => {
    it('should get app logo successfully', done => {
      const mockLogo: AppLogoDto = {
        data: 'test-logo-data',
        bodyBackground: '#ffffff',
        boxBackground: '#000000'
      };

      service.getAppLogo().subscribe(logo => {
        expect(logo).toEqual(mockLogo);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/app-logo`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogo);
    });

    it('should return null on error', done => {
      service.getAppLogo().subscribe(logo => {
        expect(logo).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/app-logo`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getResourcePackages', () => {
    it('should get resource packages successfully', done => {
      const mockPackages: ResourcePackageDto[] = [
        {
          id: 1,
          name: 'Package 1',
          elements: ['element1', 'element2'],
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'Package 2',
          elements: ['element3', 'element4'],
          createdAt: new Date()
        }
      ];

      service.getResourcePackages().subscribe(packages => {
        expect(packages).toEqual(mockPackages);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}resource-packages`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPackages);
    });

    it('should return empty array on error', done => {
      service.getResourcePackages().subscribe(packages => {
        expect(packages).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}resource-packages`);
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

    it('should return false on error', done => {
      service.setUserPassword('wrongOld', 'newPass').subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}password`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceData', () => {
    it('should get workspace data successfully', done => {
      const mockWorkspace: WorkspaceFullDto = {
        id: 1,
        name: 'Test Workspace',
        groupId: 10,
        groupName: 'Test Group',
        dropBoxId: 100,
        settings: {
          defaultEditor: 'editor1',
          defaultPlayer: 'player1',
          defaultSchemer: 'schemer1',
          unitGroups: [],
          stableModulesOnly: false
        }
      };

      service.getWorkspaceData(1).subscribe(workspace => {
        expect(workspace).toEqual(mockWorkspace);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWorkspace);
    });

    it('should return null on error', done => {
      service.getWorkspaceData(999).subscribe(workspace => {
        expect(workspace).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/999`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUserWorkspaceData', () => {
    it('should get user workspace data successfully', done => {
      const mockUserWorkspace: UserWorkspaceFullDto = {
        id: 1,
        name: 'Test Workspace',
        groupId: 10,
        groupName: 'Test Group',
        userAccessLevel: 2,
        dropBoxId: 100,
        settings: {
          defaultEditor: 'editor1',
          defaultPlayer: 'player1',
          defaultSchemer: 'schemer1',
          unitGroups: [],
          stableModulesOnly: false
        }
      };

      service.getUserWorkspaceData(1, 5).subscribe(workspace => {
        expect(workspace).toEqual(mockUserWorkspace);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserWorkspace);
    });

    it('should return null on error', done => {
      service.getUserWorkspaceData(1, 999).subscribe(workspace => {
        expect(workspace).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users/999`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setWorkspaceSettings', () => {
    it('should update workspace settings successfully', done => {
      const settings: WorkspaceSettingsDto = {
        defaultEditor: 'new-editor',
        defaultPlayer: 'new-player',
        defaultSchemer: 'new-schemer',
        unitGroups: [],
        stableModulesOnly: true
      };

      service.setWorkspaceSettings(1, settings).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/settings`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(settings);
      req.flush(null);
    });

    it('should return false on error', done => {
      const settings: WorkspaceSettingsDto = {
        defaultEditor: 'editor',
        defaultPlayer: 'player',
        defaultSchemer: 'schemer',
        unitGroups: [],
        stableModulesOnly: false
      };

      service.setWorkspaceSettings(999, settings).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/999/settings`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getEmailTemplate', () => {
    it('should get email template successfully', done => {
      const mockTemplate: EmailTemplateDto = {
        emailSubject: 'Test Subject',
        emailBody: 'Test Body'
      };

      service.getEmailTemplate().subscribe(template => {
        expect(template).toEqual(mockTemplate);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/email-template`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTemplate);
    });
  });

  describe('setEmailTemplate', () => {
    it('should update email template successfully', done => {
      const template: EmailTemplateDto = {
        emailSubject: 'New Subject',
        emailBody: 'New Body'
      };

      service.setEmailTemplate(template).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/email-template`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(template);
      req.flush(null);
    });

    it('should return false on error', done => {
      const template: EmailTemplateDto = {
        emailSubject: 'Subject',
        emailBody: 'Body'
      };

      service.setEmailTemplate(template).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/email-template`);
      req.error(new ProgressEvent('error'));
    });
  });
});
