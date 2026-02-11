import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UpdateUnitCommentUnitItemsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';

describe('Comments BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  const serverUrl = 'http://test-server/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BackendService,
        { provide: 'SERVER_URL', useValue: serverUrl }
      ]
    });
    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should update item connections for reviews', done => {
    const dto: UpdateUnitCommentUnitItemsDto = {
      unitItemUuids: ['item-1', 'item-2'],
      userId: 7
    };

    service.updateCommentItemConnections(dto, 11, 22, 33, 44).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(
      `${serverUrl}reviews/33/units/22/comments/44/items`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('should update item connections for workspaces when reviewId is 0', done => {
    const dto: UpdateUnitCommentUnitItemsDto = {
      unitItemUuids: ['item-9'],
      userId: 3
    };

    service.updateCommentItemConnections(dto, 10, 20, 0, 30).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(
      `${serverUrl}workspaces/10/units/20/comments/30/items`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('should return false when update fails', done => {
    const dto: UpdateUnitCommentUnitItemsDto = {
      unitItemUuids: ['item-1'],
      userId: 5
    };

    service.updateCommentItemConnections(dto, 1, 2, 3, 4).subscribe(result => {
      expect(result).toBe(false);
      done();
    });

    const req = httpMock.expectOne(
      `${serverUrl}reviews/3/units/2/comments/4/items`
    );
    req.error(new ProgressEvent('error'));
  });
});
