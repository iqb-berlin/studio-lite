import { NotFoundException } from '@nestjs/common';

export class AdminWorkspaceGroupNotFoundException extends NotFoundException {
  constructor(workspaceId: number, method: string) {
    const description = `Admin workspace group with id ${workspaceId} not found`;
    const objectOrError = {
      id: workspaceId, controller: 'group-admin/workspaces', method, description
    };
    super(objectOrError);
  }
}
