import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  RequestReportDto,
  UnitDefinitionDto,
  UnitPropertiesDto,
  UnitSchemeDto,
  WorkspaceGroupFullDto,
  UnitItemDto,
  UnitRichNotesDto
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

  describe('getWorkspaceGroupStates', () => {
    it('should return empty state on error', async () => {
      const resultPromise = expectObservableValue(service.getWorkspaceGroupStates(1), emptyWorkspaceGroup);

      const req = httpMock.expectOne(`${serverUrl}workspace-groups/1`);
      req.error(new ProgressEvent('error'));

      await resultPromise;
    });
  });

  describe('getUnitExportContents', () => {
    it('should return null on error, so that no file is left out for it', async () => {
      const resultPromise = expectObservableValue(service.getUnitExportContents(1), null);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/export-contents`);
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
    it('should propagate errors', async () => {
      const resultPromise = firstValueFrom(service.getCodingReport(1));

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/scheme`);
      req.error(new ProgressEvent('error'));

      await expect(resultPromise).rejects.toBeTruthy();
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

    it('should return an empty array without asking for unit 0', async () => {
      await expectObservableValue(service.getUnitItems(1, 0), []);
      httpMock.expectNone(() => true);
    });

    it('should return an empty array without asking for a unit that is no number', async () => {
      await expectObservableValue(service.getUnitItems(1, Number('abc')), []);
      httpMock.expectNone(() => true);
    });

    it('should return an empty array without asking for workspace 0', async () => {
      await expectObservableValue(service.getUnitItems(0, 1), []);
      httpMock.expectNone(() => true);
    });
  });

  describe('getUnitRichNotes', () => {
    it('should fetch the rich notes of the unit', async () => {
      const mockData: UnitRichNotesDto = { tags: [], notes: [] };
      const resultPromise = expectObservableValue(service.getUnitRichNotes(1, 1), mockData);

      const req = httpMock.expectOne(`${serverUrl}workspaces/1/units/1/rich-notes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);

      await resultPromise;
    });

    it('should return no notes without asking for unit 0', async () => {
      await expectObservableValue(service.getUnitRichNotes(1, 0), { tags: [], notes: [] });
      httpMock.expectNone(() => true);
    });
  });
  it('sends training requirement and selection to the direct codebook endpoint', () => {
    service.getCodingBook(1, '', {
      exportFormat: 'json',
      missingsProfile: '',
      hasOnlyManualCoding: true,
      hasGeneralInstructions: true,
      hasDerivedVars: true,
      hasClosedVars: false,
      hasOnlyVarsWithCodes: true,
      codeLabelToUpper: true,
      showScore: true,
      hideItemVarRelation: true,
      trainingRequirement: 'not-required'
    }, [7]).subscribe();
    const request = httpMock.expectOne(req => req.url === `${serverUrl}workspaces/1/units/coding-book`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('trainingRequirement')).toBe('not-required');
    expect(request.request.params.getAll('id')).toEqual(['7']);
    request.flush(new Blob(['[]']));
  });
});
