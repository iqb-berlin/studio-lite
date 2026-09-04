import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The `workspace_id` route parameter -- the same one the workspace guards read, so guard and
 * handler cannot end up looking at different workspaces. Handed on as the string it arrives as.
 */
export const WorkspaceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return params.workspace_id;
  }
);
