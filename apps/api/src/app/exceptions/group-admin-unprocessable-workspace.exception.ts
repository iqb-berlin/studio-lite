import { UnprocessableEntityException } from '@nestjs/common';

/**
 * Refuses another workspace in a group that has reached the limit the studio allows there. A 422
 * rather than a 403: the request is allowed, the group just cannot take it.
 */
export class GroupAdminUnprocessableWorkspaceException extends UnprocessableEntityException {
  constructor(groupId: number, method: string) {
    const description = `Creating of workspace in group with id ${groupId} is forbidden`;
    const objectOrError = {
      id: groupId, controller: 'admin/workspace-groups', method, description
    };
    super(objectOrError);
  }
}
