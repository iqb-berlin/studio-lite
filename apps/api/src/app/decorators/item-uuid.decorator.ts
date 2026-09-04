import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The `item_uuid` route parameter -- the primary key of a unit item. Not to be confused with the
 * item's `id`, which is the name it carries inside its unit and is only unique there.
 */
export const ItemUuid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return params.item_uuid;
  }
);
