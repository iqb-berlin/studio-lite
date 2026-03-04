import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  CreateWorkspaceDto,
  UnitInViewDto,
  UserFullDto,
  UserInListDto,
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  UserWorkspaceAccessForGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('returns users on success', done => {
      const users: UserInListDto[] = [{ id: 1 } as UserInListDto];

      service.getUsers().subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users`);
      expect(req.request.method).toBe('GET');
      req.flush(users);
    });

    it('returns empty array on error', done => {
      service.getUsers().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getAllUnitsForGroup', () => {
    it('returns units on success', done => {
      const units: UnitInViewDto[] = [{ id: 2 } as UnitInViewDto];

      service.getAllUnitsForGroup(7).subscribe(result => {
        expect(result).toEqual(units);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/7/units`);
      expect(req.request.method).toBe('GET');
      req.flush(units);
    });

    it('returns false on error', done => {
      service.getAllUnitsForGroup(7).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/7/units`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('deleteWorkspaceUnit', () => {
    it('returns true on success', done => {
      service.deleteWorkspaceUnit(10, 20).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20`);
      expect(req.request.method).toBe('DELETE');
      req.flush(false);
    });

    it('returns false on error', done => {
      service.deleteWorkspaceUnit(10, 20).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUsersFull', () => {
    it('requests users with full param', done => {
      const users: UserFullDto[] = [{ id: 1 } as UserFullDto];

      service.getUsersFull().subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${serverUrl}group-admin/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('full')).toBe('true');
      req.flush(users);
    });

    it('returns empty array on error', done => {
      service.getUsersFull().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${serverUrl}group-admin/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspacesByUser', () => {
    it('returns workspaces on success', done => {
      const workspaces: UsersWorkspaceInListDto[] = [{ id: 5 } as UsersWorkspaceInListDto];

      service.getWorkspacesByUser(3).subscribe(result => {
        expect(result).toEqual(workspaces);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users/3/workspaces`);
      expect(req.request.method).toBe('GET');
      req.flush(workspaces);
    });

    it('returns empty array on error', done => {
      service.getWorkspacesByUser(3).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users/3/workspaces`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setWorkspacesByUser', () => {
    it('returns true on success', done => {
      const access: UserWorkspaceAccessForGroupDto = { groupId: 4, workspaces: [] };

      service.setWorkspacesByUser(4, access).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users/4/workspaces`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(access);
      req.flush(false);
    });

    it('returns false on error', done => {
      const access: UserWorkspaceAccessForGroupDto = { groupId: 4, workspaces: [] };

      service.setWorkspacesByUser(4, access).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/users/4/workspaces`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaces', () => {
    it('returns workspaces on success', done => {
      const workspaces: UsersWorkspaceInListDto[] = [{ id: 8 } as UsersWorkspaceInListDto];

      service.getWorkspaces(12).subscribe(result => {
        expect(result).toEqual(workspaces);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/12/workspaces`);
      expect(req.request.method).toBe('GET');
      req.flush(workspaces);
    });

    it('returns empty array on error', done => {
      service.getWorkspaces(12).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/12/workspaces`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('addWorkspace', () => {
    it('returns true on success', done => {
      const payload: CreateWorkspaceDto = { name: 'Workspace' } as CreateWorkspaceDto;

      service.addWorkspace(payload).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(false);
    });

    it('returns false on error', done => {
      const payload: CreateWorkspaceDto = { name: 'Workspace' } as CreateWorkspaceDto;

      service.addWorkspace(payload).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('renameWorkspace', () => {
    it('returns true on success', done => {
      service.renameWorkspace(2, 'New Name').subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/2/name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'New Name' });
      req.flush(false);
    });

    it('returns false on error', done => {
      service.renameWorkspace(2, 'New Name').subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/2/name`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('selectWorkspaceDropBox', () => {
    it('returns true on success', done => {
      service.selectWorkspaceDropBox(2, 9).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/2/drop-box`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ dropBoxId: 9 });
      req.flush(false);
    });

    it('returns false on error', done => {
      service.selectWorkspaceDropBox(2, 9).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/2/drop-box`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.deleteWorkspaces([1, 2]).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${serverUrl}group-admin/workspaces`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.moveWorkspaces(9, [3, 4]).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/group-id`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUsersByWorkspace', () => {
    it('returns users on success', done => {
      const users: WorkspaceUserInListDto[] = [{ id: 11 } as WorkspaceUserInListDto];

      service.getUsersByWorkspace(4).subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/4/users`);
      expect(req.request.method).toBe('GET');
      req.flush(users);
    });

    it('returns empty array on error', done => {
      service.getUsersByWorkspace(4).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/4/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setUsersByWorkspace', () => {
    it('returns true on success', done => {
      const access: UserWorkspaceAccessDto[] = [{ id: 1, accessLevel: 2 }];

      service.setUsersByWorkspace(4, access).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/4/users`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(access);
      req.flush(false);
    });

    it('returns false on error', done => {
      const access: UserWorkspaceAccessDto[] = [{ id: 1, accessLevel: 2 }];

      service.setUsersByWorkspace(4, access).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}group-admin/workspaces/4/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupData', () => {
    it('returns data on success', done => {
      const data: WorkspaceGroupFullDto = { id: 1 } as WorkspaceGroupFullDto;

      service.getWorkspaceGroupData(1).subscribe(result => {
        expect(result).toEqual(data);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/1`);
      expect(req.request.method).toBe('GET');
      req.flush(data);
    });

    it('returns null on error', done => {
      service.getWorkspaceGroupData(1).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/workspace-groups/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupsByUser', () => {
    it('returns data on success', done => {
      const data: WorkspaceGroupFullDto[] = [{ id: 2 } as WorkspaceGroupFullDto];

      service.getWorkspaceGroupsByUser(12).subscribe(result => {
        expect(result).toEqual(data);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/users/12/workspace-groups`);
      expect(req.request.method).toBe('GET');
      req.flush(data);
    });

    it('returns null on error', done => {
      service.getWorkspaceGroupsByUser(12).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}admin/users/12/workspace-groups`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getXlsWorkspaces', () => {
    it('requests blob with download param', done => {
      const blob = new Blob(['data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      service.getXlsWorkspaces(5).subscribe(result => {
        expect(result).toEqual(blob);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${serverUrl}workspace-groups/5`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('download')).toBe('true');
      expect(req.request.headers.get('Accept'))
        .toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });
});
