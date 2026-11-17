import { AdminVeronaModulesNotFoundException } from './admin-verona-modules-not-found.exception';

describe('AdminVeronaModulesNotFoundException', () => {
  it('should be defined', () => {
    const exception = new AdminVeronaModulesNotFoundException('module-id', 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 'module-id',
      controller: 'verona-modules',
      method: 'GET',
      description: 'Verona module with key module-id not found'
    });
  });
});
