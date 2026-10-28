import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserFullDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';

describe('Admin BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test-url.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BackendService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'SERVER_URL', useValue: baseUrl }
      ]
    });

    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('setWorkspaceGroupProfiles', () => {
    it('returns true on success', done => {
      const settings: WorkspaceGroupSettingsDto = {} as WorkspaceGroupSettingsDto;

      service.setWorkspaceGroupProfiles(settings, 3).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/3`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ id: 3, settings });
      req.flush(false);
    });
  });

  describe('getUsersFull', () => {
    it('requests users with full param without activity header', done => {
      const users: UserFullDto[] = [{ id: 2 } as UserFullDto];

      service.getUsersFull().subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}group-admin/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('full')).toBe('true');
      expect(req.request.headers.has('x-activity-intent')).toBe(false);
      req.flush(users);
    });

    it('sets activity intent header when explicitly requested', done => {
      const users: UserFullDto[] = [{ id: 2 } as UserFullDto];

      service.getUsersFullWithActivity().subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}group-admin/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('full')).toBe('true');
      expect(req.request.headers.get('x-activity-intent')).toBe('user');
      req.flush(users);
    });
  });

  describe('deleteUsers', () => {
    it('returns true on success', done => {
      service.deleteUsers([1, 2]).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/users`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.getAll('id')).toEqual(['1', '2']);
      req.flush(false);
    });
  });

  describe('deleteVeronaModules', () => {
    it('returns true on success', done => {
      service.deleteVeronaModules(['m1', 'm2']).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/verona-modules`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.getAll('key')).toEqual(['m1', 'm2']);
      req.flush(false);
    });
  });

  describe('deleteWorkspaceGroups', () => {
    it('returns true on success', done => {
      service.deleteWorkspaceGroups([5, 6]).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/workspace-groups`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.getAll('id')).toEqual(['5', '6']);
      req.flush(false);
    });
  });

  describe('deleteResourcePackages', () => {
    it('returns true on success', done => {
      service.deleteResourcePackages([10, 11]).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/resource-packages`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.getAll('id')).toEqual(['10', '11']);
      req.flush(false);
    });
  });
});
