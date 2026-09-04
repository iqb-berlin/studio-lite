import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The review a token was issued for. A review link logs in as the review itself, not as a user, so
 * this carries the identity for those routes -- zero whenever a real user is logged in.
 */
export const ReviewId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.reviewId;
  }
);
