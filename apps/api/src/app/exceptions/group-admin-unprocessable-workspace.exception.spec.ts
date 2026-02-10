import { GroupAdminUnprocessableWorkspaceException } from './group-admin-unprocessable-workspace.exception';

describe('GroupAdminUnprocessableWorkspaceException', () => {
  it('should be defined', () => {
    const exception = new GroupAdminUnprocessableWorkspaceException(1, 'POST');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(422);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'admin/workspace-groups',
      method: 'POST',
      description: 'Creating of workspace in group with id 1 is forbidden'
    });
  });
});
