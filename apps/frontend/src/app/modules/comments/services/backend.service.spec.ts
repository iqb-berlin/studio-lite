import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UpdateUnitCommentUnitItemsDto } from '@studio-lite-lib/api-dto';
import { Observable } from 'rxjs';
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

  it('should toggle vote', done => {
    service.toggleVote(10, 20, 30, 55, 'up').subscribe(result => {
      expect(result).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}reviews/30/units/20/comments/55/vote`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ vote: 'up' });
    req.flush({});
  });

  it('should get comment voters', done => {
    const voters = [{ userName: 'User 1', vote: 'up' }];
    service.getCommentVoters(10, 20, 0, 55).subscribe(result => {
      expect(result).toEqual(voters);
      done();
    });

    const req = httpMock.expectOne(`${serverUrl}workspaces/10/units/20/comments/55/votes`);
    expect(req.request.method).toBe('GET');
    req.flush(voters);
  });

  // Each call decides on its own which route it takes; a review id of zero means the workspace.
  it.each<[string, string, (backend: BackendService) => Observable<unknown>]>([
    ['an edit', 'reviews/30/units/20/', backend => backend.updateComment(55, {}, 10, 20, 30)],
    ['a hiding', 'workspaces/10/units/20/', backend => backend.updateCommentVisibility(55, {}, 10, 20, 0)],
    ['a deletion', 'reviews/30/units/20/', backend => backend.deleteComment(55, 10, 20, 30)],
    ['a vote', 'workspaces/10/units/20/', backend => backend.toggleVote(10, 20, 0, 55, 'up')],
    ['the question for the voters', 'reviews/30/units/20/', backend => backend.getCommentVoters(10, 20, 30, 55)]
  ])('should send %s to %s', (_, route, call) => {
    call(service).subscribe();

    httpMock.expectOne(request => request.url.startsWith(`${serverUrl}${route}`)).flush([]);
  });
});
