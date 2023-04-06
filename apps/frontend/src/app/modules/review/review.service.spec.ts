import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReviewService } from './review.service';
import { environment } from '../../../environments/environment';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    });
    service = TestBed.inject(ReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
