import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * The comment routes of a review, for a logged-in user: commenting takes the same access level in
 * the review's workspace as on the workspace's own comment routes ({@link CommentAccessGuard}).
 * A user who may only read the workspace may read its review, but not discuss it (#1818).
 *
 * It runs after {@link ReviewGuard}, which has already held the user to that workspace. A review
 * login carries no user and no access level; what it may do on these routes is not decided here
 * (#1784).
 */
@Injectable()
export class ReviewCommentAccessGuard implements CanActivate {
  constructor(
    private reviewService: ReviewService,
    private workspaceUserService: WorkspaceUserService
  ) {}

  /** Passes a review login, and a user whose access level in the review's workspace allows commenting. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (Number(req.user?.reviewId) || 0) return true;

    const workspaceId = await this.reviewService.workspaceIdOf(Number(req.params.review_id) || 0);
    if (!workspaceId || !await this.workspaceUserService.canComment(Number(req.user?.id) || 0, workspaceId)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
