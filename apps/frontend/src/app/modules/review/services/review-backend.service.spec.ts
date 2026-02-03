import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  ReviewFullDto,
  UnitDefinitionDto,
  UnitItemDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { ReviewBackendService } from './review-backend.service';
import { Comment } from '../../comments/models/comment.interface';

describe('ReviewBackendService', () => {
  let service: ReviewBackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://test-server/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewBackendService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });
    service = TestBed.inject(ReviewBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUnitProperties', () => {
    it('should fetch unit properties successfully', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockProperties: UnitPropertiesDto = {
        id: unitId,
        name: 'Test Unit',
        description: 'Test Description'
      };

      service.getUnitProperties(reviewId, unitId).subscribe(result => {
        expect(result).toEqual(mockProperties);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperties);
    });

    it('should return null on error', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitProperties(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/properties`);
      req.error(new ProgressEvent('error'));
    });

    it('should handle HTTP 404 error', done => {
      const reviewId = 999;
      const unitId = 999;

      service.getUnitProperties(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/properties`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should construct correct URL with different IDs', done => {
      const reviewId = 1;
      const unitId = 2;

      service.getUnitProperties(reviewId, unitId).subscribe();

      const req = httpMock.expectOne(`${serverUrl}reviews/1/units/2/properties`);
      expect(req.request.url).toBe(`${serverUrl}reviews/1/units/2/properties`);
      req.flush({});
      done();
    });
  });

  describe('getUnitDefinition', () => {
    it('should fetch unit definition successfully', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockDefinition: UnitDefinitionDto = {
        definition: 'test-definition',
        variables: []
      };

      service.getUnitDefinition(reviewId, unitId).subscribe(result => {
        expect(result).toEqual(mockDefinition);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/definition`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDefinition);
    });

    it('should return null on error', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitDefinition(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/definition`);
      req.error(new ProgressEvent('error'));
    });

    it('should handle server error gracefully', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitDefinition(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/definition`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getReview', () => {
    it('should fetch review data successfully', done => {
      const reviewId = 789;
      const mockReview: ReviewFullDto = {
        id: reviewId,
        name: 'Test Review',
        workspaceId: 100,
        units: [1, 2, 3]
      };

      service.getReview(reviewId).subscribe(result => {
        expect(result).toEqual(mockReview);
        expect(result?.id).toBe(reviewId);
        expect(result?.name).toBe('Test Review');
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReview);
    });

    it('should return null on error', done => {
      const reviewId = 789;

      service.getReview(reviewId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}`);
      req.error(new ProgressEvent('error'));
    });

    it('should handle unauthorized access', done => {
      const reviewId = 999;

      service.getReview(reviewId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle empty review data', done => {
      const reviewId = 1;
      const mockReview: ReviewFullDto = {
        id: reviewId
      };

      service.getReview(reviewId).subscribe(result => {
        expect(result).toEqual(mockReview);
        expect(result?.id).toBe(reviewId);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}`);
      req.flush(mockReview);
    });
  });

  describe('getUnitScheme', () => {
    it('should fetch unit scheme successfully', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockScheme: UnitSchemeDto = {
        scheme: 'test-scheme',
        schemeType: 'scheme-type',
        variables: []
      };

      service.getUnitScheme(reviewId, unitId).subscribe(result => {
        expect(result).toEqual(mockScheme);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/scheme`);
      expect(req.request.method).toBe('GET');
      req.flush(mockScheme);
    });

    it('should return null on error', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitScheme(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/scheme`);
      req.error(new ProgressEvent('error'));
    });

    it('should handle network timeout', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitScheme(reviewId, unitId).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/scheme`);
      req.error(new ProgressEvent('timeout'));
    });
  });

  describe('getUnitComments', () => {
    it('should fetch unit comments successfully', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockComments: Comment[] = [
        {
          id: 1,
          body: 'Test comment 1',
          userName: 'User 1',
          itemUuids: [],
          userId: 1,
          unitId: 456,
          hidden: false,
          parentId: null,
          createdAt: new Date(),
          changedAt: new Date()
        },
        {
          id: 2,
          body: 'Test comment 2',
          userName: 'User 2',
          itemUuids: ['item-1'],
          userId: 2,
          unitId: 456,
          hidden: false,
          parentId: 1,
          createdAt: new Date(),
          changedAt: new Date()
        }
      ];

      service.getUnitComments(reviewId, unitId).subscribe(result => {
        expect(result).toEqual(mockComments);
        expect(result.length).toBe(2);
        expect(result[0].body).toBe('Test comment 1');
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should return empty array on error', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitComments(reviewId, unitId).subscribe(result => {
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/comments`);
      req.error(new ProgressEvent('error'));
    });

    it('should handle empty comments array', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitComments(reviewId, unitId).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/comments`);
      req.flush([]);
    });

    it('should handle single comment', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockComment: Comment[] = [
        {
          id: 1,
          body: 'Single comment',
          userName: 'User',
          itemUuids: [],
          userId: 1,
          unitId: 456,
          hidden: false,
          parentId: null,
          createdAt: new Date(),
          changedAt: new Date()
        }
      ];

      service.getUnitComments(reviewId, unitId).subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].body).toBe('Single comment');
        done();
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}/units/${unitId}/comments`);
      req.flush(mockComment);
    });
  });

  describe('getUnitItems', () => {
    it('should fetch unit items successfully', done => {
      const reviewId = 123;
      const unitId = 456;
      const mockItems: UnitItemDto[] = [
        {
          id: 'item-1'
        },
        {
          id: 'item-2'
        }
      ];

      service.getUnitItems(reviewId, unitId).subscribe(result => {
        expect(result).toEqual(mockItems);
        expect(result.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}reviews/${reviewId}/units/${unitId}/items`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('withoutMetadata')).toBe('true');
      req.flush(mockItems);
    });

    it('should include withoutMetadata query parameter', done => {
      const reviewId = 1;
      const unitId = 2;

      service.getUnitItems(reviewId, unitId).subscribe();

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}reviews/${reviewId}/units/${unitId}/items` &&
                   request.params.has('withoutMetadata')
      );
      expect(req.request.params.get('withoutMetadata')).toBe('true');
      req.flush([]);
      done();
    });

    it('should return empty array on error', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitItems(reviewId, unitId).subscribe(result => {
        expect(result).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}reviews/${reviewId}/units/${unitId}/items`
      );
      req.error(new ProgressEvent('error'));
    });

    it('should handle empty items array', done => {
      const reviewId = 123;
      const unitId = 456;

      service.getUnitItems(reviewId, unitId).subscribe(result => {
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(
        request => request.url === `${serverUrl}reviews/${reviewId}/units/${unitId}/items`
      );
      req.flush([]);
    });
  });

  describe('getDirectDownloadLink', () => {
    it('should return correct download link', () => {
      const link = service.getDirectDownloadLink();
      expect(link).toBe(`${serverUrl}packages/`);
    });

    it('should include trailing slash', () => {
      const link = service.getDirectDownloadLink();
      expect(link).toMatch(/\/$/);
    });

    it('should use configured server URL', () => {
      const link = service.getDirectDownloadLink();
      expect(link).toContain(serverUrl);
    });

    it('should return string type', () => {
      const link = service.getDirectDownloadLink();
      expect(typeof link).toBe('string');
    });
  });
});
