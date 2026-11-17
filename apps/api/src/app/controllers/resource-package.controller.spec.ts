import { ResourcePackageController } from './resource-package.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ResourcePackageController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should let any signed-in user reach findResourcePackages', () => {
    expect(Reflect.getMetadata('__guards__', ResourcePackageController.prototype.findResourcePackages))
      .toEqual([JwtAuthGuard]);
  });

  it.each(['removeIds', 'create'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', ResourcePackageController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );
});
