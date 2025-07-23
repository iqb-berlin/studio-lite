import { Comment } from './comment.interface';

export interface RootCommentWithReplies {
  rootComment: Comment;
  replies: Comment[];
}
