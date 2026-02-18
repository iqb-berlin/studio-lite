import { ResourcePackageNotFoundException } from './resource-package-not-found.exception';

describe('ResourcePackageNotFoundException', () => {
  it('should be defined', () => {
    const exception = new ResourcePackageNotFoundException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'workspace/:workspace_id',
      method: 'GET',
      description: 'ResourcePackage with id 1 not found'
    });
  });
});
