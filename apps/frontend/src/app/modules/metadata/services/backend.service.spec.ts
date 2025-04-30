import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MetadataBackendService } from './metadata-backend.service';

describe('BackendService', () => {
  let service: MetadataBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    });
    service = TestBed.inject(MetadataBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
