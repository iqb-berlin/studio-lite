import { UnprocessableEntityException } from '@nestjs/common';

export class GroupAdminUnprocessableWorkspaceException extends UnprocessableEntityException {
  constructor(groupId: number, method: string) {
    const description = `Creating of workspace in group with id ${groupId} is forbidden`;
    const objectOrError = {
      id: groupId, controller: 'admin/workspace-groups', method, description
    };
    super(objectOrError);
  }
}
