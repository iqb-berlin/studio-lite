import { UserWorkspaceGroupNotAdminException } from './user-workspace-group-not-admin.exception';

describe('UserWorkspaceGroupNotAdminException', () => {
  it('should be defined', () => {
    const exception = new UserWorkspaceGroupNotAdminException(1, 'POST');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(403);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'group-admin/workspaces',
      method: 'POST',
      description: 'User is not admin of 1'
    });
  });
});
