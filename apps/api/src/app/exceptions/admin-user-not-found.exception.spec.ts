import { AdminUserNotFoundException } from './admin-user-not-found.exception';

describe('AdminUserNotFoundException', () => {
  it('should be defined', () => {
    const exception = new AdminUserNotFoundException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'admin/users',
      method: 'GET',
      description: 'Admin user with id 1 not found'
    });
  });
});
