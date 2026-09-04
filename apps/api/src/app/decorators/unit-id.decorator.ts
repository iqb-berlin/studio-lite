import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The `unit_id` route parameter, as it arrives. */
export const UnitId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return params.unit_id;
  }
);
