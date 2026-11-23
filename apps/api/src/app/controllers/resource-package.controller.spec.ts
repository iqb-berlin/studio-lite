import { ResourcePackageController } from './resource-package.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ResourcePackageController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  // A group admin chooses from the packages and sees the defaults (#1358).
  it.each(['findResourcePackages', 'findDefaults'] as const)(
    'should let any signed-in user reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', ResourcePackageController.prototype[method]))
        .toEqual([JwtAuthGuard]);
    }
  );

  it.each(['removeIds', 'create', 'setDefaults', 'findGroups', 'patchPackageName'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', ResourcePackageController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );
});
