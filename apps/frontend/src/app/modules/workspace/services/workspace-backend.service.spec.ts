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
  UnitItemDto,
  UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { firstValueFrom, Observable } from 'rxjs';
import { WorkspaceBackendService } from './workspace-backend.service';

describe('WorkspaceBackendService', () => {
  let service: WorkspaceBackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://localhost:3000/api/';
  const emptyWorkspaceGroup: WorkspaceGroupFullDto = {
    id: 0,
    name: '',
    settings: {
      states: [],
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: ''
    }
  };

  const expectObservableValue = async <T>(observable: Observable<T>, expected: T): Promise<void> => {
    const result = await firstValueFrom(observable);
    expect(result).toEqual(expected);
  };

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
    it('should fetch workspace group states', async () => {
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

      const resultPromise = expectObservableValue(service.getWorkspaceGroupStates(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty state on error', async () => {
      const resultPromise = expectObservableValue(service.getWorkspaceGroupStates(1), emptyWorkspaceGroup);

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/1`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getMissingsProfiles', () => {
    it('should fetch missings profiles', async () => {
      const mockData: MissingsProfilesDto[] = [
        { id: 1, label: 'Profile 1', missings: 'missing1,missing2' }
      ];

      const resultPromise = expectObservableValue(service.getMissingsProfiles(), mockData);

      const req = httpMock.expectOne(`${serverUrl}admin/settings/missings-profiles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getMissingsProfiles(), []);

      const req = httpMock.expectOne(`${serverUrl}admin/settings/missings-profiles`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitList', () => {
    it('should fetch unit list without params', async () => {
      const mockData: UnitInListDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];

      const resultPromise = expectObservableValue(service.getUnitList(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should fetch unit list with params', async () => {
      const mockData: UnitInListDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];
      const params = new HttpParams().set('filter', 'test');

      const resultPromise = expectObservableValue(service.getUnitList(1, params), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units?filter=test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getUnitList(1), []);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUsersList', () => {
    it('should fetch users list', async () => {
      const mockData: UsersInWorkspaceDto = {
        users: [],
        workspaceGroupAdmins: [],
        admins: []
      };

      const resultPromise = expectObservableValue(service.getUsersList(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return false on error', async () => {
      const resultPromise = expectObservableValue(service.getUsersList(1), false);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/users`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitListWithProperties', () => {
    it('should fetch unit list with properties', async () => {
      const mockData: UnitPropertiesDto[] = [
        { id: 1, key: 'unit1', name: 'Unit 1' }
      ];

      const resultPromise = expectObservableValue(service.getUnitListWithProperties(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getUnitListWithProperties(1), []);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/properties`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('addUnit', () => {
    it('should add a new unit and return its id', async () => {
      const newUnit: CreateUnitDto = { key: 'unit1', name: 'Unit 1' };

      const resultPromise = expectObservableValue(service.addUnit(1, newUnit), 123);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUnit);
      req.flush(123);

      await resultPromise;
    });

    it('should return null on error', async () => {
      const newUnit: CreateUnitDto = { key: 'unit1', name: 'Unit 1' };

      const resultPromise = expectObservableValue(service.addUnit(1, newUnit), null);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('deleteUnits', () => {
    it('should delete units and return true', async () => {
      const resultPromise = expectObservableValue(service.deleteUnits(1, [1, 2, 3]), true);

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units` &&
          request.params.getAll('id')?.length === 3
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await resultPromise;
    });

    it('should return false on error', async () => {
      const resultPromise = expectObservableValue(service.deleteUnits(1, [1]), false);

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units`
      );
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('submitUnits', () => {
    it('should submit units to dropbox', async () => {
      const mockReport: RequestReportDto = {
        source: 'submit',
        messages: []
      };

      const resultPromise = expectObservableValue(service.submitUnits(1, 10, [1, 2]), mockReport);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ targetId: 10, ids: [1, 2] });
      req.flush(mockReport);

      await resultPromise;
    });

    it('should return false on error', async () => {
      const resultPromise = expectObservableValue(service.submitUnits(1, 10, [1]), false);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('returnSubmittedUnits', () => {
    it('should return submitted units', async () => {
      const mockReport: RequestReportDto = {
        source: 'return',
        messages: []
      };

      const resultPromise = expectObservableValue(service.returnSubmittedUnits(1, [1, 2]), mockReport);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/drop-box-history`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ids: [1, 2] });
      req.flush(mockReport);

      await resultPromise;
    });
  });

  describe('moveUnits', () => {
    it('should move units to target workspace', async () => {
      const mockReport: RequestReportDto = {
        source: 'move',
        messages: []
      };

      const resultPromise = expectObservableValue(service.moveUnits(1, [1, 2], 2), mockReport);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/workspace-id`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ targetId: 2, ids: [1, 2] });
      req.flush(mockReport);

      await resultPromise;
    });
  });

  describe('copyUnits', () => {
    it('should copy units without comments', async () => {
      const mockReport: RequestReportDto = {
        source: 'copy',
        messages: []
      };

      const resultPromise = expectObservableValue(service.copyUnits(1, [1, 2]), mockReport);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ids: [1, 2], addComments: undefined });
      req.flush(mockReport);

      await resultPromise;
    });

    it('should copy units with comments', async () => {
      const mockReport: RequestReportDto = {
        source: 'copy',
        messages: []
      };

      const resultPromise = expectObservableValue(service.copyUnits(1, [1, 2], true), mockReport);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ids: [1, 2], addComments: true });
      req.flush(mockReport);

      await resultPromise;
    });
  });

  describe('getUnitProperties', () => {
    it('should fetch unit properties', async () => {
      const mockData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Unit 1'
      };

      const resultPromise = expectObservableValue(service.getUnitProperties(1, 1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return null if workspaceId is 0', async () => {
      await expectObservableValue(service.getUnitProperties(0, 1), null);
    });

    it('should return null if unitId is 0', async () => {
      await expectObservableValue(service.getUnitProperties(1, 0), null);
    });

    it('should return null on error', async () => {
      const resultPromise = expectObservableValue(service.getUnitProperties(1, 1), null);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitDefinition', () => {
    it('should fetch unit definition', async () => {
      const mockData: UnitDefinitionDto = {
        definition: 'def',
        variables: []
      };

      const resultPromise = expectObservableValue(service.getUnitDefinition(1, 1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/definition`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return null if workspaceId is 0', async () => {
      await expectObservableValue(service.getUnitDefinition(0, 1), null);
    });

    it('should return null if unitId is 0', async () => {
      await expectObservableValue(service.getUnitDefinition(1, 0), null);
    });
  });

  describe('getUnitScheme', () => {
    it('should fetch unit scheme', async () => {
      const mockData: UnitSchemeDto = {
        scheme: 'scheme',
        schemeType: 'type'
      };

      const resultPromise = expectObservableValue(service.getUnitScheme(1, 1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/scheme`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return null if workspaceId is 0', async () => {
      await expectObservableValue(service.getUnitScheme(0, 1), null);
    });

    it('should return null if unitId is 0', async () => {
      await expectObservableValue(service.getUnitScheme(1, 0), null);
    });
  });

  describe('setUnitProperties', () => {
    it('should update unit properties and return true', async () => {
      const unitData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Updated Unit'
      };

      const resultPromise = expectObservableValue(service.setUnitProperties(1, unitData), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);

      await resultPromise;
    });

    it('should return false on error', async () => {
      const unitData: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Updated Unit'
      };

      const resultPromise = expectObservableValue(service.setUnitProperties(1, unitData), false);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/properties`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('setUnitDefinition', () => {
    it('should update unit definition and return true', async () => {
      const unitData: UnitDefinitionDto = {
        definition: 'new def',
        variables: []
      };

      const resultPromise = expectObservableValue(service.setUnitDefinition(1, 1, unitData), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/definition`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);

      await resultPromise;
    });
  });

  describe('setUnitScheme', () => {
    it('should update unit scheme and return true', async () => {
      const unitData: UnitSchemeDto = {
        scheme: 'new scheme',
        schemeType: 'type'
      };

      const resultPromise = expectObservableValue(service.setUnitScheme(1, 1, unitData), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/scheme`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(unitData);
      req.flush(null);

      await resultPromise;
    });
  });

  describe('getReviewList', () => {
    it('should fetch review list', async () => {
      const mockData: ReviewInListDto[] = [
        { id: 1, name: 'Review 1' }
      ];

      const resultPromise = expectObservableValue(service.getReviewList(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });
  });

  describe('getReview', () => {
    it('should fetch a specific review', async () => {
      const mockData: ReviewFullDto = {
        id: 1,
        name: 'Review 1',
        link: 'link',
        password: 'pwd'
      };

      const resultPromise = expectObservableValue(service.getReview(1, 1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return null on error', async () => {
      const resultPromise = expectObservableValue(service.getReview(1, 1), null);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('setReview', () => {
    it('should update review and return true', async () => {
      const reviewData: ReviewFullDto = {
        id: 1,
        name: 'Updated Review',
        link: 'link',
        password: 'pwd'
      };

      const resultPromise = expectObservableValue(service.setReview(1, 1, reviewData), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(reviewData);
      req.flush(null);

      await resultPromise;
    });
  });

  describe('addReview', () => {
    it('should add a new review and return its id', async () => {
      const newReview: CreateReviewDto = { name: 'New Review' };

      const resultPromise = expectObservableValue(service.addReview(1, newReview), 456);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReview);
      req.flush(456);

      await resultPromise;
    });

    it('should return null on error', async () => {
      const newReview: CreateReviewDto = { name: 'New Review' };

      const resultPromise = expectObservableValue(service.addReview(1, newReview), null);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('deleteReview', () => {
    it('should delete review and return true', async () => {
      const resultPromise = expectObservableValue(service.deleteReview(1, 1), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await resultPromise;
    });

    it('should return false on error', async () => {
      const resultPromise = expectObservableValue(service.deleteReview(1, 1), false);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/reviews/1`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getDirectDownloadLink', () => {
    it('should return the direct download link', () => {
      const link = service.getDirectDownloadLink();
      expect(link).toBe(`${serverUrl}packages/`);
    });
  });

  describe('getUnitGroups', () => {
    it('should fetch unit groups', async () => {
      const mockData = ['Group 1', 'Group 2'];

      const resultPromise = expectObservableValue(service.getUnitGroups(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/groups`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });
  });

  describe('addUnitGroup', () => {
    it('should add a new unit group and return true', async () => {
      const resultPromise = expectObservableValue(service.addUnitGroup(1, 'New Group'), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ groupName: 'New Group' });
      req.flush(null);

      await resultPromise;
    });
  });

  describe('deleteUnitGroup', () => {
    it('should delete unit group and return true', async () => {
      const resultPromise = expectObservableValue(service.deleteUnitGroup(1, 'Group 1'), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ groupName: 'Group 1', operation: 'remove' });
      req.flush(null);

      await resultPromise;
    });
  });

  describe('renameUnitGroup', () => {
    it('should rename unit group and return true', async () => {
      const resultPromise = expectObservableValue(service.renameUnitGroup(1, 'Old Name', 'New Name'), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        groupName: 'Old Name',
        newGroupName: 'New Name',
        operation: 'rename'
      });
      req.flush(null);

      await resultPromise;
    });
  });

  describe('setGroupUnits', () => {
    it('should set units for a group and return true', async () => {
      const resultPromise = expectObservableValue(service.setGroupUnits(1, 'Group 1', [1, 2, 3]), true);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/group-name`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Group 1', ids: [1, 2, 3] });
      req.flush(null);

      await resultPromise;
    });
  });

  describe('getCodingReport', () => {
    it('should fetch coding report', async () => {
      const mockData: CodingReportDto[] = [
        {
          unit: 'unit1',
          variable: 'var1',
          item: 'item1',
          validation: 'ok',
          codingType: 'manual'
        }
      ];

      const resultPromise = expectObservableValue(service.getCodingReport(1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/scheme`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getCodingReport(1), []);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/scheme`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitItems', () => {
    it('should fetch unit items without metadata', async () => {
      const mockData: UnitItemDto[] = [
        { id: 'item1' }
      ];

      const resultPromise = expectObservableValue(service.getUnitItems(1, 1), mockData);

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units/1/items` &&
          request.params.get('withoutMetadata') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getUnitItems(1, 1), []);

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}workspaces/1/units/1/items`
      );
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitRichNoteTags', () => {
    it('should fetch rich note tags', async () => {
      const mockData: UnitRichNoteTagDto[] = [
        { id: 'tag1', label: [] }
      ];

      const resultPromise = expectObservableValue(service.getUnitRichNoteTags(), mockData);

      const req = httpMock.expectOne(`${serverUrl}admin/settings/unit-rich-note-tags`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return empty array on error', async () => {
      const resultPromise = expectObservableValue(service.getUnitRichNoteTags(), []);

      const req = httpMock.expectOne(`${serverUrl}admin/settings/unit-rich-note-tags`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });
});
