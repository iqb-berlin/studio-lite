import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ItemUuid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return params.item_uuid;
  }
);
