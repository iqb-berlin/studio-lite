import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ReviewGuard } from './review.guard';
import { ReviewService } from '../services/review.service';

describe('ReviewGuard', () => {
  let guard: ReviewGuard;
  let reviewService: DeepMocked<ReviewService>;

  const contextFor = (
    user: { id: number, reviewId: number },
    params: Record<string, string>
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user, params })
    })
  });

  const reviewSession = { id: 0, reviewId: 2 };
  const loggedInUser = { id: 7, reviewId: 0 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        ReviewGuard
      ]
    }).compile();

    guard = module.get<ReviewGuard>(ReviewGuard);
    reviewService = module.get(ReviewService);
    reviewService.isUnitInReview.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for a review session on its own review', async () => {
    expect(await guard.canActivate(contextFor(reviewSession, { review_id: '2' }))).toBe(true);
  });

  it('should throw UnauthorizedException for a review session on another review', async () => {
    await expect(guard.canActivate(contextFor(reviewSession, { review_id: '3' })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should let a logged-in user pass, since their token carries no review', async () => {
    expect(await guard.canActivate(contextFor(loggedInUser, { review_id: '3' }))).toBe(true);
  });

  it('should return true for a unit the review contains', async () => {
    expect(await guard.canActivate(contextFor(reviewSession, { review_id: '2', unit_id: '5' }))).toBe(true);
    expect(reviewService.isUnitInReview).toHaveBeenCalledWith(2, 5);
  });

  it('should throw UnauthorizedException for a unit the review does not contain', async () => {
    reviewService.isUnitInReview.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(reviewSession, { review_id: '2', unit_id: '999' })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should check the unit for a logged-in user as well', async () => {
    reviewService.isUnitInReview.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '2', unit_id: '999' })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException without a review in the route', async () => {
    await expect(guard.canActivate(contextFor(reviewSession, {})))
      .rejects.toThrow(UnauthorizedException);
  });
});
