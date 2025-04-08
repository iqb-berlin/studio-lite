import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReviewBackendService } from './review-backend.service';

describe('ReviewBackendService', () => {
  let service: ReviewBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    });
    service = TestBed.inject(ReviewBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
