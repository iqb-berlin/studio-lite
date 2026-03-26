import { IsEditingPipe } from './is-editing.pipe';
import { Comment } from '../models/comment.interface';
import { ActiveComment, ActiveCommentType } from '../models/active-comment.interface';

describe('IsEditingPipe', () => {
  let pipe: IsEditingPipe;

  beforeEach(() => {
    pipe = new IsEditingPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if activeComment matches comment id and type is editing', () => {
    const comment = { id: 1 } as unknown as Comment;
    const activeComment: ActiveComment = { id: 1, type: ActiveCommentType.editing };
    expect(pipe.transform(activeComment, comment)).toBeTruthy();
  });

  it('should return false if activeComment is null', () => {
    const comment = { id: 1 } as unknown as Comment;
    expect(pipe.transform(null, comment)).toBeFalsy();
  });

  it('should return false if id does not match', () => {
    const comment = { id: 1 } as unknown as Comment;
    const activeComment: ActiveComment = { id: 2, type: ActiveCommentType.editing };
    expect(pipe.transform(activeComment, comment)).toBeFalsy();
  });

  it('should return false if type is not editing', () => {
    const comment = { id: 1 } as unknown as Comment;
    const activeComment: ActiveComment = { id: 1, type: ActiveCommentType.replying };
    expect(pipe.transform(activeComment, comment)).toBeFalsy();
  });
});
