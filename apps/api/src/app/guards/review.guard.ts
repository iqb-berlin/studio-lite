import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { UsersService } from '../services/users.service';

/**
 * Ties a review route to the review it claims to be about, and to the people who may open it.
 * Three questions, all of which the routes under `reviews/:review_id` used to leave unasked:
 *
 * 1. A review login carries the review it was issued for in its token. It may reach that review and
 *    no other -- the id in the path has to be the same one.
 * 2. A logged-in user carries no review in the token. They may open a review of a workspace they
 *    may enter -- assigned to it, an administrator, or the admin of its group, the same people
 *    {@link WorkspaceGuard} lets in. Anyone else uses the review's link and password, which is what
 *    they are for. Before, any account reached any review by its id (#1818).
 * 3. The unit named in the path has to be part of that review. Without this the routes answered for
 *    any unit whose id was known, including units of a different workspace.
 *
 * A review that does not exist is refused like one that may not be opened, so the answer does not
 * tell which review ids exist.
 */
@Injectable()
export class ReviewGuard implements CanActivate {
  constructor(
    private reviewService: ReviewService,
    private usersService: UsersService
  ) {}

  /** Refuses another review than the token's, one the user may not open, and a unit not in the review. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const reviewId = Number(req.params.review_id);
    if (!reviewId) throw new ForbiddenException();

    const tokenReviewId = Number(req.user?.reviewId) || 0;
    if (tokenReviewId) {
      if (tokenReviewId !== reviewId) throw new ForbiddenException();
    } else if (!await this.mayUserOpen(Number(req.user?.id) || 0, reviewId)) {
      throw new ForbiddenException();
    }

    const unitId = Number(req.params.unit_id) || 0;
    if (unitId && !await this.reviewService.isUnitInReview(reviewId, unitId)) {
      throw new ForbiddenException();
    }
    return true;
  }

  /** Whether the user may enter the workspace of the review; false as well for a review that does not exist. */
  private async mayUserOpen(userId: number, reviewId: number): Promise<boolean> {
    const workspaceId = await this.reviewService.workspaceIdOf(reviewId);
    return !!userId && !!workspaceId && this.usersService.canAccessWorkSpace(userId, workspaceId);
  }
}
