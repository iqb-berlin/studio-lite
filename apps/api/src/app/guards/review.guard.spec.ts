import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ReviewGuard } from './review.guard';
import { ReviewService } from '../services/review.service';
import { UsersService } from '../services/users.service';

describe('ReviewGuard', () => {
  let guard: ReviewGuard;
  let reviewService: DeepMocked<ReviewService>;
  let usersService: DeepMocked<UsersService>;

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
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        ReviewGuard
      ]
    }).compile();

    guard = module.get<ReviewGuard>(ReviewGuard);
    reviewService = module.get(ReviewService);
    usersService = module.get(UsersService);
    reviewService.isUnitInReview.mockResolvedValue(true);
    reviewService.workspaceIdOf.mockResolvedValue(11);
    usersService.canAccessWorkSpace.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for a review session on its own review', async () => {
    expect(await guard.canActivate(contextFor(reviewSession, { review_id: '2' }))).toBe(true);
  });

  it('should not ask a review session about workspaces', async () => {
    await guard.canActivate(contextFor(reviewSession, { review_id: '2' }));
    expect(usersService.canAccessWorkSpace).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException for a review session on another review', async () => {
    await expect(guard.canActivate(contextFor(reviewSession, { review_id: '3' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should let a logged-in user pass who may enter the review\'s workspace', async () => {
    expect(await guard.canActivate(contextFor(loggedInUser, { review_id: '3' }))).toBe(true);
    expect(reviewService.workspaceIdOf).toHaveBeenCalledWith(3);
    expect(usersService.canAccessWorkSpace).toHaveBeenCalledWith(7, 11);
  });

  it('should throw ForbiddenException for a logged-in user without access to the review\'s workspace', async () => {
    usersService.canAccessWorkSpace.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '3' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for a logged-in user on a review that does not exist', async () => {
    reviewService.workspaceIdOf.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '999' })))
      .rejects.toThrow(ForbiddenException);
    expect(usersService.canAccessWorkSpace).not.toHaveBeenCalled();
  });

  it('should return true for a unit the review contains', async () => {
    expect(await guard.canActivate(contextFor(reviewSession, { review_id: '2', unit_id: '5' }))).toBe(true);
    expect(reviewService.isUnitInReview).toHaveBeenCalledWith(2, 5);
  });

  it('should throw ForbiddenException for a unit the review does not contain', async () => {
    reviewService.isUnitInReview.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(reviewSession, { review_id: '2', unit_id: '999' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should check the unit for a logged-in user as well', async () => {
    reviewService.isUnitInReview.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '2', unit_id: '999' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException without a review in the route', async () => {
    await expect(guard.canActivate(contextFor(reviewSession, {})))
      .rejects.toThrow(ForbiddenException);
  });
});
