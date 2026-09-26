import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The `workspace_group_id` route parameter, parsed to a number. */
/** The decorator's body, named so a test can call it without going through Nest. */
export const workspaceGroupIdFromRequest = (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const params = request.params;
  return parseInt(params.workspace_group_id, 10);
};

export const WorkspaceGroupId = createParamDecorator(workspaceGroupIdFromRequest);
