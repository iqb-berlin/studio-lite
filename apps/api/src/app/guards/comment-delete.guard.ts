import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';

/**
 * A comment may only be deleted by whoever wrote it -- not by anyone else with write access to the
 * workspace. Ownership, not access level, so this guard asks the comment and not the workspace.
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
