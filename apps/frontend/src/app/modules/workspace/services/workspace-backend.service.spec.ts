import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  MissingsProfilesDto,
  CodingReportDto,
  CreateReviewDto,
  CreateUnitDto,
  RequestReportDto,
  ReviewFullDto,
  ReviewInListDto,
  UnitDefinitionDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto,
  UsersInWorkspaceDto,
  WorkspaceGroupFullDto,
  UnitItemDto
} from '@studio-lite-lib/api-dto';
import { WorkspaceBackendService } from './workspace-backend.service';

describe('WorkspaceBackendService', () => {
  let service: WorkspaceBackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://localhost:3000/api/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WorkspaceBackendService,
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });
    service = TestBed.inject(WorkspaceBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWorkspaceGroupStates', () => {
    it('should fetch workspace group states', () => {
      const mockData: WorkspaceGroupFullDto = {
        id: 1,
        name: 'Test Group',
        settings: {
          states: [],
          defaultEditor: '',
          defaultPlayer: '',
          defaultSchemer: ''
        }
      };

      service.getWorkspaceGroupStates(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getWorkspaceGroupStates(1).subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getMissingsProfiles', () => {
    it('should fetch missings profiles', () => {
      const mockData: MissingsProfilesDto[] = [
        { id: 1, label: 'Profile 1', missings: 'missing1,missing2' }
      ];

      service.getMissingsProfiles().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/missings-profiles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getMissingsProfiles().subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(`${serverUrl}admin/settings/missings-profiles`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUnitList', () => {
    it('should fetch unit list without params', () => {
      const mockData: UnitInListDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];

      service.getUnitList(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should fetch unit list with params', () => {
      const mockData: UnitInListDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];
      const params = new HttpParams().set('filter', 'test');

      service.getUnitList(1, params).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units?filter=test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getUnitList(1).subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUsersList', () => {
    it('should fetch users list', () => {
      const mockData: UsersInWorkspaceDto = {
        users: [],
        workspaceGroupAdmins: [],
        admins: []
      };

      service.getUsersList(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return false on error', () => {
      service.getUsersList(1).subscribe(data => {
        expect(data).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUnitListWithProperties', () => {
    it('should fetch unit list with properties', () => {
      const mockData: UnitPropertiesDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];

      service.getUnitListWithProperties(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getUnitListWithProperties(1).subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/properties`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('addUnit', () => {
    it('should add a new unit and return its id', () => {
      const newUnit: CreateUnitDto = { key: 'unit1', name: 'Unit 1' };

      service.addUnit(1, newUnit).subscribe(id => {
        expect(id).toBe(123);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUnit);
      req.flush(123);
    });

    it('should return null on error', () => {
      const newUnit: CreateUnitDto = { key: 'unit1', name: 'Unit 1' };

      service.addUnit(1, newUnit).subscribe(id => {
        expect(id).toBeNull();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('deleteUnits', () => {
    it('should delete units and return true', () => {
      service.deleteUnits(1, [1, 2, 3]).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units` &&
          request.params.getAll('id')?.length === 3
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should return false on error', () => {
      service.deleteUnits(1, [1]).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units`
      );
      req.error(new ProgressEvent('error'));
    });
  });

  describe('submitUnits', () => {
    it('should submit units to dropbox', () => {
      const mockReport: RequestReportDto = {
        source: 'submit',
        messages: []
      };

      service.submitUnits(1, 10, [1, 2]).subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ targetId: 10, ids: [1, 2] });
      req.flush(mockReport);
    });

    it('should return false on error', () => {
      service.submitUnits(1, 10, [1]).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('returnSubmittedUnits', () => {
    it('should return submitted units', () => {
      const mockReport: RequestReportDto = {
        source: 'return',
        messages: []
      };

      service.returnSubmittedUnits(1, [1, 2]).subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ids: [1, 2] });
      req.flush(mockReport);
    });
  });

  describe('moveUnits', () => {
    it('should move units to target workspace', () => {
      const mockReport: RequestReportDto = {
        source: 'move',
        messages: []
      };

      service.moveUnits(1, [1, 2], 2).subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/workspace-id`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ targetId: 2, ids: [1, 2] });
      req.flush(mockReport);
    });
  });

  describe('copyUnits', () => {
    it('should copy units without comments', () => {
      const mockReport: RequestReportDto = {
        source: 'copy',
        messages: []
      };

      service.copyUnits(1, [1, 2]).subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ids: [1, 2], addComments: undefined });
      req.flush(mockReport);
    });

    it('should copy units with comments', () => {
      const mockReport: RequestReportDto = {
        source: 'copy',
        messages: []
      };

      service.copyUnits(1, [1, 2], true).subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ids: [1, 2], addComments: true });
      req.flush(mockReport);
    });
  });

  describe('getUnitProperties', () => {
    it('should fetch unit properties', () => {
      const mockData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Unit 1'
      };

      service.getUnitProperties(1, 1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return null if workspaceId is 0', done => {
      service.getUnitProperties(0, 1).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should return null if unitId is 0', done => {
      service.getUnitProperties(1, 0).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should return null on error', () => {
      service.getUnitProperties(1, 1).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUnitDefinition', () => {
    it('should fetch unit definition', () => {
      const mockData: UnitDefinitionDto = {
        definition: 'def',
        variables: []
      };

      service.getUnitDefinition(1, 1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/definition`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return null if workspaceId is 0', done => {
      service.getUnitDefinition(0, 1).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should return null if unitId is 0', done => {
      service.getUnitDefinition(1, 0).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('getUnitScheme', () => {
    it('should fetch unit scheme', () => {
      const mockData: UnitSchemeDto = {
        scheme: 'scheme',
        schemeType: 'type'
      };

      service.getUnitScheme(1, 1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/scheme`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return null if workspaceId is 0', done => {
      service.getUnitScheme(0, 1).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });

    it('should return null if unitId is 0', done => {
      service.getUnitScheme(1, 0).subscribe(data => {
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('setUnitProperties', () => {
    it('should update unit properties and return true', () => {
      const unitData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Updated Unit'
      };

      service.setUnitProperties(1, unitData).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);
    });

    it('should return false on error', () => {
      const unitData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Updated Unit'
      };

      service.setUnitProperties(1, unitData).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setUnitDefinition', () => {
    it('should update unit definition and return true', () => {
      const unitData: UnitDefinitionDto = {
        definition: 'new def',
        variables: []
      };

      service.setUnitDefinition(1, 1, unitData).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/definition`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);
    });
  });

  describe('setUnitScheme', () => {
    it('should update unit scheme and return true', () => {
      const unitData: UnitSchemeDto = {
        scheme: 'new scheme',
        schemeType: 'type'
      };

      service.setUnitScheme(1, 1, unitData).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/scheme`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);
    });
  });

  describe('getReviewList', () => {
    it('should fetch review list', () => {
      const mockData: ReviewInListDto[] = [
        { id: 1, name: 'Review 1' }
      ];

      service.getReviewList(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getReview', () => {
    it('should fetch a specific review', () => {
      const mockData: ReviewFullDto = {
        id: 1,
        name: 'Review 1',
        link: 'link',
        password: 'pwd'
      };

      service.getReview(1, 1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return null on error', () => {
      service.getReview(1, 1).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('setReview', () => {
    it('should update review and return true', () => {
      const reviewData: ReviewFullDto = {
        id: 1,
        name: 'Updated Review',
        link: 'link',
        password: 'pwd'
      };

      service.setReview(1, 1, reviewData).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(reviewData);
      req.flush(null);
    });
  });

  describe('addReview', () => {
    it('should add a new review and return its id', () => {
      const newReview: CreateReviewDto = { name: 'New Review' };

      service.addReview(1, newReview).subscribe(id => {
        expect(id).toBe(456);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReview);
      req.flush(456);
    });

    it('should return null on error', () => {
      const newReview: CreateReviewDto = { name: 'New Review' };

      service.addReview(1, newReview).subscribe(id => {
        expect(id).toBeNull();
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('deleteReview', () => {
    it('should delete review and return true', () => {
      service.deleteReview(1, 1).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should return false on error', () => {
      service.deleteReview(1, 1).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getDirectDownloadLink', () => {
    it('should return the direct download link', () => {
      const link = service.getDirectDownloadLink();
      expect(link).toBe(`${serverUrl}packages/`);
    });
  });

  describe('getUnitGroups', () => {
    it('should fetch unit groups', () => {
      const mockData = ['Group 1', 'Group 2'];

      service.getUnitGroups(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/groups`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('addUnitGroup', () => {
    it('should add a new unit group and return true', () => {
      service.addUnitGroup(1, 'New Group').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ groupName: 'New Group' });
      req.flush(null);
    });
  });

  describe('deleteUnitGroup', () => {
    it('should delete unit group and return true', () => {
      service.deleteUnitGroup(1, 'Group 1').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ groupName: 'Group 1', operation: 'remove' });
      req.flush(null);
    });
  });

  describe('renameUnitGroup', () => {
    it('should rename unit group and return true', () => {
      service.renameUnitGroup(1, 'Old Name', 'New Name').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        groupName: 'Old Name',
        newGroupName: 'New Name',
        operation: 'rename'
      });
      req.flush(null);
    });
  });

  describe('setGroupUnits', () => {
    it('should set units for a group and return true', () => {
      service.setGroupUnits(1, 'Group 1', [1, 2, 3]).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Group 1', ids: [1, 2, 3] });
      req.flush(null);
    });
  });

  describe('getCodingReport', () => {
    it('should fetch coding report', () => {
      const mockData: CodingReportDto[] = [
        {
          unit: 'unit1',
          variable: 'var1',
          item: 'item1',
          validation: 'ok',
          codingType: 'manual'
        }
      ];

      service.getCodingReport(1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/scheme`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getCodingReport(1).subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/scheme`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getUnitItems', () => {
    it('should fetch unit items without metadata', () => {
      const mockData: UnitItemDto[] = [
        { id: 'item1' }
      ];

      service.getUnitItems(1, 1).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units/1/items` &&
          request.params.get('withoutMetadata') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should return empty array on error', () => {
      service.getUnitItems(1, 1).subscribe(data => {
        expect(data).toEqual([]);
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units/1/items`
      );
      req.error(new ProgressEvent('error'));
    });
  });
});
