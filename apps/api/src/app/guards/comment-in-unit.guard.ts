import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';

/**
 * A comment is only found under the unit it was written on: the route
 * `units/:unit_id/comments/:id` names both, and this guard holds the route to it (#1697). A
 * comment asked for under another unit is answered as not being there, a 404.
 *
 * It is the second half of the path: that the unit is in the workspace of the route is asked
 * before, by {@link UnitInWorkspaceGuard}. With both, a comment can only be reached under its own
 * unit in its own workspace.
 *
 * The route parameter is compared as the text it arrives as. Parsing it first is what let `abc`
 * through before (#1696): `Number('abc') || 0` came out as "no unit given" and skipped the check.
 */
@Injectable()
export class CommentInUnitGuard implements CanActivate {
  constructor(private unitCommentService: UnitCommentService) {}

  /** Passes when the comment in the route belongs to the unit in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const commentId = Number(req.params.id ?? req.params.comment_id) || 0;
    if (!commentId) throw new ForbiddenException();
    const comment = await this.unitCommentService.findOneComment(commentId);
    if (req.params.unit_id !== String(comment.unitId)) {
      throw new UnitCommentNotFoundException(commentId, req.method);
    }
    return true;
  }
}
