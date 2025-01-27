import { ForbiddenException } from '@nestjs/common';

export class UserHasNoWorkspaceAccessException extends ForbiddenException {
  constructor(workspaceId: number, method: string) {
    const description = `User does not have permission for workspace ${workspaceId}`;
    const objectOrError = {
      id: workspaceId, controller: 'workspaces', method, description
    };
    super(objectOrError);
  }
}
