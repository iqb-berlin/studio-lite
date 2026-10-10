import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';

/**
 * Which items a comment is about may be set by whoever wrote it. On a review route that has two
 * cases: a user's comment carries their id, which has to be the token's; a review login has no
 * user, and its comments carry none -- it may set the items of such a comment only.
 *
 * The second case is why {@link CommentWriteGuard} cannot serve here: the studio sends the items of
 * a new comment in a second call right after creating it, and a review login has to be able to
 * make that call for the comment it has just written (#1784). Which unit the comment belongs to is
 * asked by {@link CommentInUnitGuard}, before this one (#1777).
 */
@Injectable()
export class ReviewCommentOwnerGuard implements CanActivate {
  constructor(private unitCommentService: UnitCommentService) {}

  /** Passes for a user's own comment, and for a review login on a comment written without an account. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const commentId = Number(req.params.comment_id) || 0;
    if (!commentId) throw new ForbiddenException();
    const userId = Number(req.user?.id) || 0;
    const comment = await this.unitCommentService.findOneComment(commentId);
    if ((Number(comment.userId) || 0) !== userId) throw new ForbiddenException();
    return true;
  }
}
