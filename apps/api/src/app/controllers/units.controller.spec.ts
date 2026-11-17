import { UnitsController } from './units.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('UnitsController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should let only administrators reach findAll', () => {
    expect(Reflect.getMetadata('__guards__', UnitsController.prototype.findAll))
      .toEqual([JwtAuthGuard, IsAdminGuard]);
  });
});
