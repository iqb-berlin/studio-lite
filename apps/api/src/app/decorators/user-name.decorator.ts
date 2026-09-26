import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The login name from the token. Empty for a review login, which carries no user name. */
/** The decorator's body, named so a test can call it without going through Nest. */
export const userNameFromRequest = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user.name;
};

export const UserName = createParamDecorator(userNameFromRequest);
