import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  AppLogoDto,
  ConfigDto,
  CreateUserDto,
  CreateWorkspaceGroupDto,
  MissingsProfilesDto,
  ProfilesRegistryDto,
  UnitExportConfigDto,
  UnitInViewDto,
  UserFullDto,
  UserInListDto,
  WorkspaceFullDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto,
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllWorkspaces', () => {
    it('returns workspaces on success', done => {
      const workspaces: WorkspaceFullDto[] = [{ id: 1 } as WorkspaceFullDto];

      service.getAllWorkspaces().subscribe(result => {
        expect(result).toEqual(workspaces);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspaces`);
      expect(req.request.method).toBe('GET');
      req.flush(workspaces);
    });

    it('returns false on error', done => {
      service.getAllWorkspaces().subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspaces`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getAllUnits', () => {
    it('returns units on success', done => {
      const units: UnitInViewDto[] = [{ id: 2 } as UnitInViewDto];

      service.getAllUnits().subscribe(result => {
        expect(result).toEqual(units);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/units`);
      expect(req.request.method).toBe('GET');
      req.flush(units);
    });

    it('returns false on error', done => {
      service.getAllUnits().subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/units`);
      req.error(new ProgressEvent('error'));
    });
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

    it('returns false on error', done => {
      const settings: WorkspaceGroupSettingsDto = {} as WorkspaceGroupSettingsDto;

      service.setWorkspaceGroupProfiles(settings, 3).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/3`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupById', () => {
    it('returns group on success', done => {
      const group: WorkspaceGroupFullDto = { id: 5 } as WorkspaceGroupFullDto;

      service.getWorkspaceGroupById(5).subscribe(result => {
        expect(result).toEqual(group);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/5`);
      expect(req.request.method).toBe('GET');
      req.flush(group);
    });

    it('returns false on error', done => {
      service.getWorkspaceGroupById(5).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/5`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceById', () => {
    it('returns workspace on success', done => {
      const workspace: WorkspaceFullDto = { id: 7 } as WorkspaceFullDto;

      service.getWorkspaceById(7).subscribe(result => {
        expect(result).toEqual(workspace);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}workspaces/7`);
      expect(req.request.method).toBe('GET');
      req.flush(workspace);
    });

    it('returns false on error', done => {
      service.getWorkspaceById(7).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}workspaces/7`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUsers', () => {
    it('returns users on success', done => {
      const users: UserInListDto[] = [{ id: 1 } as UserInListDto];

      service.getUsers().subscribe(result => {
        expect(result).toEqual(users);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}group-admin/users`);
      expect(req.request.method).toBe('GET');
      req.flush(users);
    });

    it('returns empty array on error', done => {
      service.getUsers().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}group-admin/users`);
      req.error(new ProgressEvent('error'));
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

    it('returns empty array on error', done => {
      service.getUsersFull().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}group-admin/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('addUser', () => {
    it('returns true on success', done => {
      const payload: CreateUserDto = { name: 'User' } as CreateUserDto;

      service.addUser(payload).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(false);
    });

    it('returns false on error', done => {
      const payload: CreateUserDto = { name: 'User' } as CreateUserDto;

      service.addUser(payload).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('changeUserData', () => {
    it('returns true on success', done => {
      const payload: UserFullDto = { id: 3 } as UserFullDto;

      service.changeUserData(3, payload).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/3`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(false);
    });

    it('returns false on error', done => {
      const payload: UserFullDto = { id: 3 } as UserFullDto;

      service.changeUserData(3, payload).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/3`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.deleteUsers([1, 2]).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupsByAdmin', () => {
    it('returns workspace groups on success', done => {
      const groups: WorkspaceGroupInListDto[] = [{ id: 9 } as WorkspaceGroupInListDto];

      service.getWorkspaceGroupsByAdmin(4).subscribe(result => {
        expect(result).toEqual(groups);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/4/workspace-groups`);
      expect(req.request.method).toBe('GET');
      req.flush(groups);
    });

    it('returns empty array on error', done => {
      service.getWorkspaceGroupsByAdmin(4).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/4/workspace-groups`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setWorkspaceGroupsByAdmin', () => {
    it('returns true on success', done => {
      const accessTo = [1, 3];

      service.setWorkspaceGroupsByAdmin(6, accessTo).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/6/workspace-groups`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ids: accessTo });
      req.flush(false);
    });

    it('returns false on error', done => {
      const accessTo = [1, 3];

      service.setWorkspaceGroupsByAdmin(6, accessTo).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/users/6/workspace-groups`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupAdmins', () => {
    it('returns admins on success', done => {
      const admins: UserInListDto[] = [{ id: 10 } as UserInListDto];

      service.getWorkspaceGroupAdmins(8).subscribe(result => {
        expect(result).toEqual(admins);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/8/admins`);
      expect(req.request.method).toBe('GET');
      req.flush(admins);
    });

    it('returns empty array on error', done => {
      service.getWorkspaceGroupAdmins(8).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/8/admins`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setWorkspaceGroupAdmins', () => {
    it('returns true on success', done => {
      const accessTo = [2, 4];

      service.setWorkspaceGroupAdmins(9, accessTo).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/9/admins`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(accessTo);
      req.flush(false);
    });

    it('returns false on error', done => {
      const accessTo = [2, 4];

      service.setWorkspaceGroupAdmins(9, accessTo).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/9/admins`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.deleteVeronaModules(['m1']).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/verona-modules`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getWorkspaceGroupList', () => {
    it('returns workspace groups on success', done => {
      const groups: WorkspaceGroupInListDto[] = [{ id: 11 } as WorkspaceGroupInListDto];

      service.getWorkspaceGroupList().subscribe(result => {
        expect(result).toEqual(groups);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups`);
      expect(req.request.method).toBe('GET');
      req.flush(groups);
    });

    it('returns empty array on error', done => {
      service.getWorkspaceGroupList().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('addWorkspaceGroup', () => {
    it('returns response on success', done => {
      const payload: CreateWorkspaceGroupDto = { name: 'Group' } as CreateWorkspaceGroupDto;

      service.addWorkspaceGroup(payload).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(true);
    });

    it('returns false on error', done => {
      const payload: CreateWorkspaceGroupDto = { name: 'Group' } as CreateWorkspaceGroupDto;

      service.addWorkspaceGroup(payload).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.deleteWorkspaceGroups([5]).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/workspace-groups`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('changeWorkspaceGroup', () => {
    it('returns true on success', done => {
      const payload: WorkspaceGroupFullDto = { id: 12 } as WorkspaceGroupFullDto;

      service.changeWorkspaceGroup(payload).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/12`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(false);
    });

    it('returns false on error', done => {
      const payload: WorkspaceGroupFullDto = { id: 12 } as WorkspaceGroupFullDto;

      service.changeWorkspaceGroup(payload).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/12`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setAppConfig', () => {
    it('returns true on success', done => {
      const config: ConfigDto = {
        appTitle: 'Test Studio',
        introHtml: '<p>intro</p>',
        imprintHtml: '<p>imprint</p>',
        emailSubject: 'Subject',
        emailBody: 'Body',
        globalWarningText: 'Warning',
        globalWarningExpiredDay: new Date('2026-01-01'),
        globalWarningExpiredHour: 12,
        hasUsers: true
      };

      service.setAppConfig(config).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/config`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(config);
      req.flush(false);
    });

    it('returns false on error', done => {
      const config: ConfigDto = {
        appTitle: 'Test Studio',
        introHtml: '<p>intro</p>',
        imprintHtml: '<p>imprint</p>',
        emailSubject: 'Subject',
        emailBody: 'Body',
        globalWarningText: 'Warning',
        globalWarningExpiredDay: new Date('2026-01-01'),
        globalWarningExpiredHour: 12,
        hasUsers: true
      };

      service.setAppConfig(config).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/config`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setAppLogo', () => {
    it('returns true on success', done => {
      const logo: AppLogoDto = {
        data: 'data:image/png;base64,AAA',
        bodyBackground: '#ffffff',
        boxBackground: '#000000'
      };

      service.setAppLogo(logo).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/app-logo`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(logo);
      req.flush(false);
    });

    it('returns false on error', done => {
      const logo: AppLogoDto = {
        data: 'data:image/png;base64,AAA',
        bodyBackground: '#ffffff',
        boxBackground: '#000000'
      };

      service.setAppLogo(logo).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/app-logo`);
      req.error(new ProgressEvent('error'));
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

    it('returns false on error', done => {
      service.deleteResourcePackages([10]).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/resource-packages`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getProfilesRegistry', () => {
    it('returns registry on success', done => {
      const registry: ProfilesRegistryDto = {
        csvUrl: 'https://example.com/registry.csv'
      };

      service.getProfilesRegistry().subscribe(result => {
        expect(result).toEqual(registry);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/profiles-registry`);
      expect(req.request.method).toBe('GET');
      req.flush(registry);
    });
  });

  describe('setProfilesRegistry', () => {
    it('returns true on success', done => {
      const registry: ProfilesRegistryDto = {
        csvUrl: 'https://example.com/registry.csv'
      };

      service.setProfilesRegistry(registry).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/profiles-registry`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(registry);
      req.flush(false);
    });

    it('returns false on error', done => {
      const registry: ProfilesRegistryDto = {
        csvUrl: 'https://example.com/registry.csv'
      };

      service.setProfilesRegistry(registry).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/profiles-registry`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUnitExportConfig', () => {
    it('returns config on success', done => {
      const config: UnitExportConfigDto = {
        unitXsdUrl: 'https://example.com/unit.xsd',
        bookletXsdUrl: 'https://example.com/booklet.xsd',
        testTakersXsdUrl: 'https://example.com/testtakers.xsd'
      };

      service.getUnitExportConfig().subscribe(result => {
        expect(result).toEqual(config);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/unit-export-config`);
      expect(req.request.method).toBe('GET');
      req.flush(config);
    });
  });

  describe('setUnitExportConfig', () => {
    it('returns true on success', done => {
      const config: UnitExportConfigDto = {
        unitXsdUrl: 'https://example.com/unit.xsd',
        bookletXsdUrl: 'https://example.com/booklet.xsd',
        testTakersXsdUrl: 'https://example.com/testtakers.xsd'
      };

      service.setUnitExportConfig(config).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/unit-export-config`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(config);
      req.flush(false);
    });

    it('returns false on error', done => {
      const config: UnitExportConfigDto = {
        unitXsdUrl: 'https://example.com/unit.xsd',
        bookletXsdUrl: 'https://example.com/booklet.xsd',
        testTakersXsdUrl: 'https://example.com/testtakers.xsd'
      };

      service.setUnitExportConfig(config).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/unit-export-config`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setMissingsProfiles', () => {
    it('returns true on success', done => {
      const missings: MissingsProfilesDto[] = [{ id: 1, label: 'Profile 1', missings: 'p1' }];

      service.setMissingsProfiles(missings).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/missings-profiles`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(missings);
      req.flush(false);
    });

    it('returns false on error', done => {
      const missings: MissingsProfilesDto[] = [{ id: 1, label: 'Profile 1', missings: 'p1' }];

      service.setMissingsProfiles(missings).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/missings-profiles`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getMissingsProfiles', () => {
    it('returns missings on success', done => {
      const missings: MissingsProfilesDto[] = [{ id: 2, label: 'Profile 2', missings: 'p2' }];

      service.getMissingsProfiles().subscribe(result => {
        expect(result).toEqual(missings);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/missings-profiles`);
      expect(req.request.method).toBe('GET');
      req.flush(missings);
    });

    it('completes without emitting on error (current implementation)', done => {
      let emitted = false;

      service.getMissingsProfiles().subscribe({
        next: () => {
          emitted = true;
        },
        complete: () => {
          expect(emitted).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}admin/settings/missings-profiles`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('downloadModule', () => {
    it('requests module blob with download param', done => {
      const blob = new Blob(['test'], { type: 'text/html' });

      service.downloadModule('m1').subscribe(result => {
        expect(result).toEqual(blob);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}verona-modules/m1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('text/html');
      expect(req.request.params.get('download')).toBe('true');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });

  describe('getUnits', () => {
    it('returns units on success', done => {
      const units: UnitInViewDto[] = [{ id: 20 } as UnitInViewDto];

      service.getUnits().subscribe(result => {
        expect(result).toEqual(units);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/units`);
      expect(req.request.method).toBe('GET');
      req.flush(units);
    });

    it('returns empty array on error', done => {
      service.getUnits().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}admin/workspace-groups/units`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getXlsWorkspaces', () => {
    it('requests xlsx blob with download param', done => {
      const blob = new Blob(['xlsx'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      service.getXlsWorkspaces().subscribe(result => {
        expect(result).toEqual(blob);
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}admin/workspace-groups`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept'))
        .toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(req.request.params.get('download')).toBe('true');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });
  });
});
