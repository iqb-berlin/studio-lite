import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The `workspace_id` route parameter -- the same one the workspace guards read, so guard and
 * handler cannot end up looking at different workspaces. Handed on as the string it arrives as.
 */
/** The decorator's body, named so a test can call it without going through Nest. */
export const workspaceIdFromRequest = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const params = request.params;
  return params.workspace_id;
};

export const WorkspaceId = createParamDecorator(workspaceIdFromRequest);
