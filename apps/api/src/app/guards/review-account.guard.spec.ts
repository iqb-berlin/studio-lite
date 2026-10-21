import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { ReviewAccountGuard } from './review-account.guard';

describe('ReviewAccountGuard', () => {
  const guard = new ReviewAccountGuard();

  const contextFor = (user: { id: number, reviewId: number }): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user, params: { review_id: '2' } })
    })
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should let a logged-in user pass', () => {
    expect(guard.canActivate(contextFor({ id: 7, reviewId: 0 }))).toBe(true);
  });

  it('should throw ForbiddenException for a review login', () => {
    expect(() => guard.canActivate(contextFor({ id: 0, reviewId: 2 }))).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for a token without a user', () => {
    expect(() => guard.canActivate(contextFor({ id: 0, reviewId: 0 }))).toThrow(ForbiddenException);
  });
});
