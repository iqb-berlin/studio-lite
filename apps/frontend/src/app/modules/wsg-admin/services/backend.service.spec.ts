import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BackendService } from './backend.service';

describe('WsgAdmin BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://test-server/api/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BackendService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });

    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getWorkspacesByUser', () => {
    // An empty list instead would show the user without rights in the group, and saving one role
    // would remove the user from every other workspace of the group (#2074).
    it('should answer a failed request with null', done => {
      service.getWorkspacesByUser(7).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      httpMock.expectOne(`${serverUrl}group-admin/users/7/workspaces`)
        .flush('error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUsersByWorkspace', () => {
    // An empty list instead would show the workspace without users, and saving one role would
    // remove everyone else from it (#2074).
    it('should answer a failed request with null', done => {
      service.getUsersByWorkspace(3).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      httpMock.expectOne(`${serverUrl}group-admin/workspaces/3/users`)
        .flush('error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('deleteWorkspaces', () => {
    it('returns true on success', done => {
      service.deleteWorkspaces([1, 2]).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${serverUrl}group-admin/workspaces`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.getAll('id')).toEqual(['1', '2']);
      req.flush(false);
    });
  });

  describe('moveWorkspaces', () => {
    it('returns true on success', done => {
      service.moveWorkspaces(9, [3, 4]).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/group-id`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ targetId: 9, ids: [3, 4] });
      req.flush({ ok: true });
    });
  });
});
