import { createMock } from '@golevelup/ts-jest';
import { RootCommentsWithRepliesPipe } from './root-comments-with-replies.pipe';
import { Comment } from '../models/comment.interface';

describe('RootCommentsWithRepliesPipe', () => {
  const pipe = new RootCommentsWithRepliesPipe();
  const comment = (id: number, parentId: number | null): Comment => createMock<Comment>({ id, parentId });

  // A reply written after a later comment used to be printed under that later comment (#2109).
  it('should put a late reply under the comment it answers', () => {
    const threads = pipe.transform([comment(1, null), comment(2, null), comment(3, 1)]);

    expect(threads.map(thread => ({
      root: thread.rootComment.id,
      replies: thread.replies.map(reply => reply.id)
    }))).toEqual([{ root: 1, replies: [3] }, { root: 2, replies: [] }]);
  });

  it('should keep the order of the comments and of the replies as the API hands them over', () => {
    const threads = pipe.transform([
      comment(5, null), comment(6, 5), comment(2, null), comment(9, 5), comment(4, 2)
    ]);

    expect(threads.map(thread => [thread.rootComment.id, ...thread.replies.map(reply => reply.id)]))
      .toEqual([[5, 6, 9], [2, 4]]);
  });

  // Only data from before #1776 can hold one; the discussion has never shown it.
  it('should leave out a reply whose comment is missing', () => {
    const threads = pipe.transform([comment(1, null), comment(3, 99)]);

    expect(threads.map(thread => ({
      root: thread.rootComment.id,
      replies: thread.replies.map(reply => reply.id)
    }))).toEqual([{ root: 1, replies: [] }]);
  });
});
