import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';

/**
 * Would let only the author of a comment delete it -- ownership rather than access level, which is
 * why it asks the comment and not the workspace.
 *
 * Not in use: no route carries it. `DELETE …/comments/:id` guards with `CommentAccessGuard`
 * instead, so anyone who may comment in the workspace may delete any comment in it. The todo above
 * that route says what the open question is -- a group admin has to be able to delete as well, and
 * this guard does not let them.
 */
@Injectable()
export class CommentDeleteGuard implements CanActivate {
  constructor(
    private unitCommentService: UnitCommentService
  ) {}

  /** Passes when the comment named in `route.params.id` belongs to the requesting user. */
  // eslint-disable-next-line class-methods-use-this
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const commentId = req.params.id;
    const comment = await this.unitCommentService.findOneComment(commentId);
    const canAccess = userId === comment.userId;
    if (!canAccess) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
