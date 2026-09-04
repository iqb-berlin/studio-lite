import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';

/**
 * Ties a review route to the review it claims to be about. Two questions, both of which the routes
 * under `reviews/:review_id` used to leave unasked:
 *
 * 1. A review login carries the review it was issued for in its token. It may reach that review and
 *    no other -- the id in the path has to be the same one.
 * 2. The unit named in the path has to be part of that review. Without this the routes answered for
 *    any unit whose id was known, including units of a different workspace.
 *
 * A logged-in user carries no review in the token and passes the first question; which reviews a
 * user may open is decided by their workspaces, not here.
 */
@Injectable()
export class ReviewGuard implements CanActivate {
  constructor(private reviewService: ReviewService) {}

  /** Refuses a review other than the token's, and a unit the review does not contain. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const reviewId = Number(req.params.review_id);
    if (!reviewId) throw new UnauthorizedException();

    const tokenReviewId = Number(req.user?.reviewId) || 0;
    if (tokenReviewId && tokenReviewId !== reviewId) throw new UnauthorizedException();

    const unitId = Number(req.params.unit_id) || 0;
    if (unitId && !await this.reviewService.isUnitInReview(reviewId, unitId)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
