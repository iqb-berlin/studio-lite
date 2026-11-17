import { UnitItemsController } from './unit-items.controller';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('UnitItemsController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should let only administrators reach findAll', () => {
    expect(Reflect.getMetadata('__guards__', UnitItemsController.prototype.findAll))
      .toEqual([JwtAuthGuard, IsAdminGuard]);
  });
});
