import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReviewId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.reviewId;
  }
);
