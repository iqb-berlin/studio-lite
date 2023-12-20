import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MetadataService } from './metadata.service';
import { environment } from '../../../../environments/environment';

describe('MetadataService', () => {
  let service: MetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    });
    service = TestBed.inject(MetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
