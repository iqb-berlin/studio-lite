import { AdminWorkspaceGroupNotFoundException } from './admin-workspace-group-not-found.exception';

describe('AdminWorkspaceGroupNotFoundException', () => {
  it('should be defined', () => {
    const exception = new AdminWorkspaceGroupNotFoundException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'group-admin/workspaces',
      method: 'GET',
      description: 'Admin workspace group with id 1 not found'
    });
  });
});
