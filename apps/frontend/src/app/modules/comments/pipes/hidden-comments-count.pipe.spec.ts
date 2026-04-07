import { HiddenCommentsCountPipe } from './hidden-comments-count.pipe';
import { RootCommentWithReplies } from '../models/root-comment-with-replies.interface';
import { Comment } from '../models/comment.interface';

describe('HiddenCommentsCountPipe', () => {
  let pipe: HiddenCommentsCountPipe;

  beforeEach(() => {
    pipe = new HiddenCommentsCountPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 0 for empty comments', () => {
    expect(pipe.transform([])).toBe(0);
  });

  it('should count hidden root comments and their replies', () => {
    const comments: RootCommentWithReplies[] = [
      {
        rootComment: { hidden: true } as unknown as Comment,
        replies: [{ hidden: false }, { hidden: true }] as unknown as Comment[]
      }
    ];
    // root (1) + replies (2) = 3
    expect(pipe.transform(comments)).toBe(3);
  });

  it('should count only hidden replies if root is not hidden', () => {
    const comments: RootCommentWithReplies[] = [
      {
        rootComment: { hidden: false } as unknown as Comment,
        replies: [{ hidden: false }, { hidden: true }, { hidden: true }] as unknown as Comment[]
      }
    ];
    // only hidden replies = 2
    expect(pipe.transform(comments)).toBe(2);
  });

  it('should handle mixed visibility across multiple roots', () => {
    const comments: RootCommentWithReplies[] = [
      {
        rootComment: { hidden: true } as unknown as Comment,
        replies: [{ hidden: false }] as unknown as Comment[]
      },
      {
        rootComment: { hidden: false } as unknown as Comment,
        replies: [{ hidden: true }, { hidden: false }] as unknown as Comment[]
      }
    ];
    // Root 1 (hidden) + 1 reply = 2
    // Root 2 (visible) + 1 hidden reply = 1
    // Total = 3
    expect(pipe.transform(comments)).toBe(3);
  });
});
