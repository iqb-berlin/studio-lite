import { AdminVeronaModulesNotFoundException } from './admin-verona-modules-not-found.exception';

describe('AdminVeronaModulesNotFoundException', () => {
  it('should be defined', () => {
    const exception = new AdminVeronaModulesNotFoundException('module-id', 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 'module-id',
      controller: 'admin/verona-modules',
      method: 'GET',
      description: 'Admin verona modules with id module-id not found'
    });
  });
});
