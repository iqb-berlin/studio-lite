import { AdminWorkspaceNotFoundException } from './admin-workspace-not-found.exception';

describe('AdminWorkspaceNotFoundException', () => {
  it('should be defined', () => {
    const exception = new AdminWorkspaceNotFoundException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'admin/workspace-groups',
      method: 'GET',
      description: 'Admin workspace with id 1 not found'
    });
  });
});
