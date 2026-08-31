import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The login name from the token. Empty for a review login, which carries no user name. */
export const UserName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.name;
  }
);
