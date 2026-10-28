import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReviewBackendService } from './review-backend.service';

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

  describe('getReview', () => {
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

    it('should pass on a 403, which tells the reviewer to use the review link (#1818)', done => {
      const reviewId = 999;

      service.getReview(reviewId).subscribe({
        next: () => done(new Error('expected an error')),
        error: error => {
          expect(error.status).toBe(403);
          done();
        }
      });

      const req = httpMock.expectOne(`${serverUrl}reviews/${reviewId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
