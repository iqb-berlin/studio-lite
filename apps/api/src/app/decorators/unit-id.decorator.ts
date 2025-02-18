import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UnitId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return params.unit_id;
  }
);
