import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  MetadataProfileDto,
  MetadataVocabularyDto,
  RegisteredMetadataProfileDto
} from '@studio-lite-lib/api-dto';
import { MetadataBackendService } from './metadata-backend.service';

describe('MetadataBackendService', () => {
  let service: MetadataBackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://test-url.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MetadataBackendService,
        {
          provide: 'SERVER_URL',
          useValue: serverUrl
        }
      ]
    });
    service = TestBed.inject(MetadataBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetadataVocabulariesForProfile', () => {
    it('should return vocabularies on success', () => {
      const mockVocabs: MetadataVocabularyDto[] = [{ id: 'v1' } as MetadataVocabularyDto];
      const testUrl = 'test-profile-url';

      service.getMetadataVocabulariesForProfile(testUrl).subscribe(result => {
        expect(result).toEqual(mockVocabs);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/vocabularies?url=${testUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVocabs);
    });

    it('should return false on error', () => {
      const testUrl = 'test-profile-url';

      service.getMetadataVocabulariesForProfile(testUrl).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/vocabularies?url=${testUrl}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getMetadataProfile', () => {
    it('should return profile on success', () => {
      const mockProfile: MetadataProfileDto = { id: 'p1' } as MetadataProfileDto;
      const testUrl = 'test-profile-url';

      service.getMetadataProfile(testUrl).subscribe(result => {
        expect(result).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/profiles?url=${testUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('should return false on error', () => {
      const testUrl = 'test-profile-url';

      service.getMetadataProfile(testUrl).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/profiles?url=${testUrl}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getRegisteredProfiles', () => {
    it('should return registered profiles on success', () => {
      const mockProfiles: RegisteredMetadataProfileDto[] = [{ url: 'u1' } as RegisteredMetadataProfileDto];

      service.getRegisteredProfiles().subscribe(result => {
        expect(result).toEqual(mockProfiles);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/registry`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfiles);
    });

    it('should return false on error', () => {
      service.getRegisteredProfiles().subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${serverUrl}metadata/registry`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
