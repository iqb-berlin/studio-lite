import { AdminResourcePackageController } from './admin-resource-package.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AdminResourcePackageController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['removeIds', 'create'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', AdminResourcePackageController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );
});
