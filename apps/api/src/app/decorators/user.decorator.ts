import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import UserEntity from '../entities/user.entity';

/**
 * The whole user object the passport strategy put on the request. Prefer {@link UserId} or
 * {@link UserName} where only one field is needed -- what is on the request is what
 * `JwtStrategy.validate` returns, not a database row, and typing it as the entity promises more
 * than is there.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
  }
);
