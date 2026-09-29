import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The id of the authenticated user, taken from the token rather than from the request, so no route
 * has to trust a client-sent user id. Zero for a review login, which is not a user.
 */
/** The decorator's body, named so a test can call it without going through Nest. */
export const userIdFromRequest = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.id;
};

export const UserId = createParamDecorator(userIdFromRequest);
