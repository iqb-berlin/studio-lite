import { VeronaModuleController } from './verona-module.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('VeronaModuleController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['findAllByType', 'findFileById'] as const)(
    'should let any signed-in user reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', VeronaModuleController.prototype[method]))
        .toEqual([JwtAuthGuard]);
    }
  );
});
