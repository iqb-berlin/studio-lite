import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';

/**
 * A comment may only be changed by whoever wrote it.
 *
 * The question is asked of the comment, not of the request: this guard loads the comment named in
 * the route and compares its author with the user the token was issued for. It used to compare the
 * `userId` in the BODY instead -- a value the client fills in, so naming yourself as the author was
 * enough to rewrite someone else's comment.
 *
 * A review session cannot pass: its comments are written with no user id, so ownership cannot be
 * established for them. The studio does not offer editing there either.
 */
@Injectable()
export class CommentWriteGuard implements CanActivate {
  constructor(private unitCommentService: UnitCommentService) {}

  /** Passes when the comment in the route belongs to the requesting user. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = Number(req.user?.id) || 0;
    const commentId = Number(req.params.id ?? req.params.comment_id) || 0;
    if (!userId || !commentId) throw new UnauthorizedException();
    const comment = await this.unitCommentService.findOneComment(commentId);
    if (comment.userId !== userId) throw new UnauthorizedException();
    return true;
  }
}
