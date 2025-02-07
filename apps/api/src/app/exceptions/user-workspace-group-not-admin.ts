import { ForbiddenException } from '@nestjs/common';

export class UserWorkspaceGroupNotAdminException extends ForbiddenException {
  constructor(workspaceGroupId: number, method: string) {
    const description = `User is not admin of ${workspaceGroupId}`;
    const objectOrError = {
      id: workspaceGroupId, controller: 'group-admin/workspaces', method, description
    };
    super(objectOrError);
  }
}
