import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The id of the authenticated user, taken from the token rather than from the request, so no route
 * has to trust a client-sent user id. Zero for a review login, which is not a user.
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id;
  }
);
