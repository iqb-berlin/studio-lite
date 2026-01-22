import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VeronaModuleInListDto, VeronaModuleFileDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';

describe('BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://test-url.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BackendService,
        { provide: 'SERVER_URL', useValue: baseUrl }
      ]
    });
    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

    it('should return empty array on error', done => {
      service.getModuleList().subscribe(modules => {
        expect(modules).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}verona-modules`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('getModuleHtml', () => {
    it('should fetch module HTML', done => {
      const mockFile: VeronaModuleFileDto = {
        key: 'm1',
        name: 'M1',
        file: '<html lang=""></html>'
      };

      service.getModuleHtml('m1').subscribe(fileData => {
        expect(fileData).toEqual(mockFile);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}verona-modules/m1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFile);
    });

    it('should return null on error', done => {
      service.getModuleHtml('m1').subscribe(fileData => {
        expect(fileData).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}verona-modules/m1`);
      req.error(new ProgressEvent('Network error'));
    });
  });
});
