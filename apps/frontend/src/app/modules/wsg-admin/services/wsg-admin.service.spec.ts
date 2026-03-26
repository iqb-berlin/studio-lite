import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { WsgAdminService } from './wsg-admin.service';

describe('WsgAdminService', () => {
  let service: WsgAdminService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://test-server/api/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsgAdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });

    service = TestBed.inject(WsgAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize behavior subjects with default values', () => {
    expect(service.selectedWorkspaceGroupId.getValue()).toBe(0);
    expect(service.selectedWorkspaceGroupName.getValue()).toBe('');
    expect(service.selectedWorkspaceGroupSettings.getValue()).toEqual({
      defaultSchemer: '',
      defaultPlayer: '',
      defaultEditor: ''
    });
  });

  describe('setWorkspaceGroupSettings', () => {
    it('returns true on success', done => {
      const settings: WorkspaceGroupSettingsDto = {
        defaultSchemer: 'schemer',
        defaultPlayer: 'player',
        defaultEditor: 'editor'
      };

      service.setWorkspaceGroupSettings(3, settings).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/3`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ id: 3, settings });
      req.flush(false);
    });

    it('returns false on error', done => {
      const settings: WorkspaceGroupSettingsDto = {
        defaultSchemer: 'schemer',
        defaultPlayer: 'player',
        defaultEditor: 'editor'
      };

      service.setWorkspaceGroupSettings(3, settings).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/3`);
      req.error(new ProgressEvent('error'));
    });
  });
});
