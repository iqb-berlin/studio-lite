import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ReviewService } from '../services/review.service';
import {
  REVIEW_CONFIG_REQUIRED_KEY,
  ReviewConfigSetting
} from '../decorators/review-config-required.decorator';

/**
 * Holds a review route to the review's settings: a route marked with {@link ReviewConfigRequired}
 * answers only when every setting it names is switched on. The studio hides what a setting switches
 * off; the API used to answer anyway, so a review login could comment where commenting was off and
 * read the coding and the comments of others where they were not shown (#1784).
 *
 * A setting counts as on only when it is explicitly true, as the review's pages read it: a review
 * whose configuration leaves a setting out shows nothing for it either.
 *
 * It runs after {@link ReviewGuard}, which has tied the route to a review its caller may open.
 */
@Injectable()
export class ReviewConfigGuard implements CanActivate {
  constructor(
    private reviewService: ReviewService,
    private reflector: Reflector
  ) {}

  /** Passes when the review has every setting the route requires switched on. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<ReviewConfigSetting[]>(
      REVIEW_CONFIG_REQUIRED_KEY,
      [context.getHandler(), context.getClass()]
    ) || [];
    if (!required.length) return true;

    const req = context.switchToHttp().getRequest();
    const config = await this.reviewService.reviewConfigOf(Number(req.params.review_id) || 0);
    if (!required.every(setting => config[setting] === true)) throw new ForbiddenException();
    return true;
  }
}
