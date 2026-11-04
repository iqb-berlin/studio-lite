import { AdminController } from './admin.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AdminController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['getAllWorkspaces', 'getAllUnits', 'getAllUnitItems'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', AdminController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );
});
