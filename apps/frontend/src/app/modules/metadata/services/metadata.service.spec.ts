import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MDProfile } from '@iqb/metadata';
import {
  MetadataVocabularyDto, TopConcept, UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MetadataService } from './metadata.service';
import { MetadataBackendService } from './metadata-backend.service';
import { WorkspaceService } from '../../workspace/services/workspace.service';

describe('MetadataService', () => {
  let service: MetadataService;
  let httpMock: HttpTestingController;
  let backendServiceMock: DeepMocked<MetadataBackendService>;
  let workspaceServiceMock: DeepMocked<WorkspaceService>;
  const serverUrl = 'http://test-url.com/';

  beforeEach(() => {
    backendServiceMock = createMock<MetadataBackendService>();
    workspaceServiceMock = createMock<WorkspaceService>();
    Object.defineProperty(workspaceServiceMock, 'selectedWorkspaceId', { get: () => 123 });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MetadataService,
        { provide: MetadataBackendService, useValue: backendServiceMock },
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });

    service = TestBed.inject(MetadataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProfileVocabularies', () => {
    it('should load vocabularies and map IDs', async () => {
      const mockProfile = {
        id: 'p1',
        groups: [
          {
            entries: [
              {
                type: 'vocabulary',
                parameters: { url: 'v1' }
              }
            ]
          }
        ]
      } as unknown as MDProfile;

      const mockVocabs: MetadataVocabularyDto[] = [
        {
          id: 'v1',
          hasTopConcept: [
            {
              id: 'c1',
              prefLabel: { de: 'Label 1' },
              narrower: [
                { id: 'c1.1', prefLabel: { de: 'Label 1.1' } } as TopConcept
              ]
            } as TopConcept
          ]
        } as MetadataVocabularyDto
      ];

      backendServiceMock.getMetadataVocabulariesForProfile.mockReturnValue(of(mockVocabs));

      const result = await service.loadProfileVocabularies(mockProfile);

      expect(result).toBe(true);
      expect(service.vocabularies.length).toBe(1);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.idLabelDictionary['c1']).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.idLabelDictionary['c1'].labels.de).toBe('Label 1');
      expect(service.idLabelDictionary['c1.1']).toBeDefined();
      expect(service.idLabelDictionary['c1.1'].labels.de).toBe('Label 1.1');
    });

    it('should resolve false if backend returns null or true (error states)', async () => {
      backendServiceMock.getMetadataVocabulariesForProfile.mockReturnValue(of(true));
      const result = await service.loadProfileVocabularies({ id: 'p1', groups: [] } as unknown as MDProfile);
      expect(result).toBe(false);
    });
  });

  describe('downloadMetadataReport', () => {
    it('should make GET request with correct params', () => {
      const reportType = 'test-type';
      const columns = ['col1', 'col2'];
      const units = [1, 2];

      service.downloadMetadataReport(reportType, columns, units).subscribe();

      // eslint-disable-next-line no-unexpected-multiline
      const req = httpMock.expectOne(request => request.url === `${serverUrl}workspaces/123/units/properties` &&
        request.params.get('type') === reportType &&
        request.params.getAll('column')?.length === 2 &&
        request.params.getAll('id')?.length === 2);

      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob());
    });
  });

  describe('createMetadataReport', () => {
    it('should return report data on success', () => {
      const mockReport: UnitPropertiesDto[] = [{ id: 1 } as unknown as UnitPropertiesDto];

      service.createMetadataReport().subscribe(result => {
        expect(result).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/123/units/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReport);
    });

    it('should return false on error', () => {
      service.createMetadataReport().subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}workspaces/123/units/properties`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
