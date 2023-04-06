import { IsCommentCommittablePipe } from './is-comment-commitable.pipe';

describe('IsCommentCommittablePipe', () => {
  it('create an instance', () => {
    const pipe = new IsCommentCommittablePipe();
    expect(pipe).toBeTruthy();
  });
});
