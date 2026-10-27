import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentService]
    });
    service = TestBed.inject(CommentService);
  });

  it('should initialize showHiddenComments to false', () => {
    expect(service.showHiddenComments.value).toBeFalsy();
  });
});
