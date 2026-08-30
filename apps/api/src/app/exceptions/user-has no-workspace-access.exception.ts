import { ForbiddenException } from '@nestjs/common';

/**
 * The user is not assigned to this workspace. Raised inside a service that has already looked the
 * assignment up; the guards in `guards/` answer the same question before a handler runs.
 */
export class UserHasNoWorkspaceAccessException extends ForbiddenException {
  constructor(workspaceId: number, method: string) {
    const description = `User does not have permission for workspace ${workspaceId}`;
    const objectOrError = {
      id: workspaceId, controller: 'workspaces', method, description
    };
    super(objectOrError);
  }
}
