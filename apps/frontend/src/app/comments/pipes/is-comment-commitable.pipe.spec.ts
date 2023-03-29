import { IsCommentCommitablePipe } from './is-comment-commitable.pipe';

describe('IsCommentCommitablePipe', () => {
  it('create an instance', () => {
    const pipe = new IsCommentCommitablePipe();
    expect(pipe).toBeTruthy();
  });
});
