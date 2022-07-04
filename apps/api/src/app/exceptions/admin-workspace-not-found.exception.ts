import { NotFoundException } from '@nestjs/common';

export class AdminWorkspaceNotFoundException extends NotFoundException {
  constructor(workspaceId: number) {
    const description = `Workspace with id ${workspaceId} not found`;
    const objectOrError = { id: workspaceId, controller: 'admin/workspaces', description };
    super(objectOrError);
  }
}
