import { NotFoundException } from '@nestjs/common';

export class AdminWorkspaceGroupNotFoundException extends NotFoundException {
  constructor(workspaceId: number) {
    const description = `Admin workspace group with id ${workspaceId} not found`;
    const objectOrError = { id: workspaceId, controller: 'admin/workspaces', description };
    super(objectOrError);
  }
}
