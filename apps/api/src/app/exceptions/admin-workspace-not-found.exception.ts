import { NotFoundException } from '@nestjs/common';

/** No workspace with this id, raised from the administration rather than from inside a workspace. */
export class AdminWorkspaceNotFoundException extends NotFoundException {
  constructor(workspaceId: number, method: string) {
    const description = `Admin workspace with id ${workspaceId} not found`;
    const objectOrError = {
      id: workspaceId, controller: 'admin/workspace-groups', method, description
    };
    super(objectOrError);
  }
}
