import { FilteredRootCommentsPipe } from './filtered-root-comments.pipe';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';
import { Comment } from '../models/comment.interface';

describe('FilteredRootCommentsPipe', () => {
  let pipe: FilteredRootCommentsPipe;

  beforeEach(() => {
    pipe = new FilteredRootCommentsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all root comments if itemFilters is empty', () => {
    const comments = [{ rootComment: { id: 1 } }] as RootCommentWithReplies[];
    expect(pipe.transform(comments, [])).toEqual(comments);
  });

  it('should include root comment if its own itemUuids match filter', () => {
    const comments = [
      {
        rootComment: { itemUuids: ['uuid1'] } as unknown as Comment,
        replies: []
      }
    ] as RootCommentWithReplies[];
    expect(pipe.transform(comments, ['uuid1'])).toEqual(comments);
  });

  it('should include root comment if one of its replies itemUuids match filter', () => {
    const comments = [
      {
        rootComment: { itemUuids: [] } as unknown as Comment,
        replies: [{ itemUuids: ['uuid1'] } as Comment]
      }
    ] as RootCommentWithReplies[];
    expect(pipe.transform(comments, ['uuid1'])).toEqual(comments);
  });

  it('should include root comment with no-items if filter includes "no-items"', () => {
    const comments = [
      {
        rootComment: { itemUuids: [] } as unknown as Comment,
        replies: []
      }
    ] as RootCommentWithReplies[];
    expect(pipe.transform(comments, ['no-items'])).toEqual(comments);
  });

  it('should include root comment if a reply has no-items and filter includes "no-items"', () => {
    const comments = [
      {
        rootComment: { itemUuids: ['uuid1'] } as unknown as Comment,
        replies: [{ itemUuids: [] } as unknown as Comment]
      }
    ] as RootCommentWithReplies[];
    expect(pipe.transform(comments, ['no-items'])).toEqual(comments);
  });

  it('should filter out root comments where neither root nor replies match filter', () => {
    const comments = [
      {
        rootComment: { itemUuids: ['uuid1'] } as unknown as Comment,
        replies: [{ itemUuids: ['uuid1'] } as unknown as Comment]
      }
    ] as RootCommentWithReplies[];
    expect(pipe.transform(comments, ['uuid2'])).toEqual([]);
  });
});
