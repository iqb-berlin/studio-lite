import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The `unit_id` route parameter, as it arrives. */
/** The decorator's body, named so a test can call it without going through Nest. */
export const unitIdFromRequest = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const params = request.params;
  return params.unit_id;
};

export const UnitId = createParamDecorator(unitIdFromRequest);
