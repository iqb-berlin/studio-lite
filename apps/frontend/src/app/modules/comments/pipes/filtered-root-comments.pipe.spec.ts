import { createMock } from '@golevelup/ts-jest';
import { FilteredRootCommentsPipe } from './filtered-root-comments.pipe';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';
import { Comment } from '../models/comment.interface';

describe('FilteredRootCommentsPipe', () => {
  let pipe: FilteredRootCommentsPipe;

  beforeEach(() => {
    pipe = new FilteredRootCommentsPipe();
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

  describe('vote filters', () => {
    const comment = (upVotes?: number, downVotes?: number): Comment => createMock<Comment>({
      upVotes, downVotes, itemUuids: []
    });
    const thread = (rootComment: Comment, ...replies: Comment[]): RootCommentWithReplies => ({ rootComment, replies });
    const upVotedRoot = thread(comment(1, 0));
    const downVotedReply = thread(comment(), comment(0, 2));
    const splitThread = thread(comment(1, 0), comment(0, 1));
    const controversialReply = thread(comment(), comment(1, 1));
    const threads = [upVotedRoot, downVotedReply, splitThread, controversialReply];

    // A thread counts as controversial only when one of its comments has votes both ways.
    it.each<[string[], RootCommentWithReplies[]]>([
      [['up'], [upVotedRoot, splitThread, controversialReply]],
      [['down'], [downVotedReply, splitThread, controversialReply]],
      [['controversial'], [controversialReply]]
    ])('should keep the threads whose root comment or a reply the vote filter %j asks for', (voteFilters, kept) => {
      expect(pipe.transform(threads, [], voteFilters)).toEqual(kept);
    });
  });
});
