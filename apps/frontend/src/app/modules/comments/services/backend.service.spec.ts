import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UpdateUnitCommentUnitItemsDto, UpdateUnitUserDto } from '@studio-lite-lib/api-dto';
import { Comment } from '../models/comment.interface';
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

  it('should get comments for reviews', done => {
    service.getComments(10, 20, 30).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}reviews/30/units/20/comments`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get comments for workspaces when reviewId is 0 or less', done => {
    service.getComments(10, 20, 0).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should handle error when getting comments', done => {
    service.getComments(10, 20, 0).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments`);
    req.error(new ProgressEvent('error'));
  });

  it('should update comments', done => {
    const dto = { status: 'reviewed' } as unknown as UpdateUnitUserDto;
    service.updateComments(dto, 10, 20).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('should create a comment for reviews', done => {
    const comment = { text: 'test' } as unknown as Partial<Comment>;
    service.createComment(comment, 10, 20, 30).subscribe(result => {
      expect(result).toBe(42);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}reviews/30/units/20/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(comment);
    req.flush('42');
  });

  it('should handle error when creating a comment', done => {
    service.createComment({}, 10, 20, 0).subscribe(result => {
      expect(result).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments`);
    req.error(new ProgressEvent('error'));
  });

  it('should update a comment by id', done => {
    const body = { text: 'updated test' } as unknown as Partial<Comment>;
    service.updateComment(55, body, 10, 20, 0).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments/55`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should update comment visibility', done => {
    const body = { hidden: true } as unknown as Partial<Comment>;
    service.updateCommentVisibility(55, body, 10, 20, 30).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}reviews/30/units/20/comments/55/hidden`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should delete a comment', done => {
    service.deleteComment(55, 10, 20, 0).subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments/55`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
