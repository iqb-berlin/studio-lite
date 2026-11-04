import { ReviewController } from './review.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';

describe('ReviewController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should hold findOne to a review its caller may open', () => {
    expect(Reflect.getMetadata('__guards__', ReviewController.prototype.findOne))
      .toEqual([JwtAuthGuard, ReviewGuard]);
  });
});
