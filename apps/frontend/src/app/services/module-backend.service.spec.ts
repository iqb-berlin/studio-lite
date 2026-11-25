import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { ModuleBackendService } from './module-backend.service';

describe('ModuleBackendService', () => {
  let service: ModuleBackendService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test-url.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ModuleBackendService,
        { provide: 'SERVER_URL', useValue: baseUrl }
      ]
    });
    service = TestBed.inject(ModuleBackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getModuleList', () => {
    it('should fetch module list without type', done => {
      const mockModules: VeronaModuleInListDto[] = [
        {
          key: 'm1',
          sortKey: 'm1',
          fileSize: 100,
          fileDateTime: 1234567,
          metadata: {
            id: 'm1',
            name: 'M1',
            type: 'player',
            model: 'aspect',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }
      ];

      service.getModuleList().subscribe(modules => {
        expect(modules).toEqual(mockModules);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}verona-modules`);
      expect(req.request.method).toBe('GET');
      req.flush(mockModules);
    });

    it('should fetch module list with type', done => {
      service.getModuleList('editor').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}verona-modules?type=editor`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    // an empty list would pass for an installation without modules (#2135)
    it('should answer null, not an empty list, when the list could not be loaded', done => {
      service.getModuleList('PLAYER').subscribe(modules => {
        expect(modules).toBeNull();
        done();
      });

      httpMock.expectOne(`${baseUrl}verona-modules?type=PLAYER`)
        .flush('', { status: 500, statusText: 'Server Error' });
    });
  });
});
