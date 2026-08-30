import { NotFoundException } from '@nestjs/common';

/** No workspace group with this id, raised from the group administration. */
export class AdminWorkspaceGroupNotFoundException extends NotFoundException {
  constructor(workspaceGroupId: number, method: string) {
    const description = `Admin workspace group with id ${workspaceGroupId} not found`;
    const objectOrError = {
      id: workspaceGroupId, controller: 'admin/workspace-groups', method, description
    };
    super(objectOrError);
  }
}
