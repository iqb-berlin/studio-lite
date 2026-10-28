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
