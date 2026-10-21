import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';

/**
 * A review route that takes an account: a review login -- the review's link and password, with no
 * user behind it -- is refused. Hiding a comment is such a route. It hides the comment from everyone
 * who reads the discussion, and a visitor with no identity may not decide that about the comments
 * of others (#1784).
 */
@Injectable()
export class ReviewAccountGuard implements CanActivate {
  /** Refuses a token issued for a review instead of a user. */
  // eslint-disable-next-line class-methods-use-this
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if ((Number(req.user?.reviewId) || 0) || !(Number(req.user?.id) || 0)) throw new ForbiddenException();
    return true;
  }
}
