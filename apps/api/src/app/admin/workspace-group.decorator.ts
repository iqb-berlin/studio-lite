import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WorkspaceGroupId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;
    return parseInt(params.workspace_group_id, 10);
  }
);
