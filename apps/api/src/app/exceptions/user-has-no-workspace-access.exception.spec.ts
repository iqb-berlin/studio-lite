import { UserHasNoWorkspaceAccessException } from './user-has no-workspace-access.exception';

describe('UserHasNoWorkspaceAccessException', () => {
  it('should be defined', () => {
    const exception = new UserHasNoWorkspaceAccessException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(403);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'workspaces',
      method: 'GET',
      description: 'User does not have permission for workspace 1'
    });
  });
});
