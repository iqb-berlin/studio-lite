import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ReviewCommentAccessGuard } from './review-comment-access.guard';
import { ReviewService } from '../services/review.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('ReviewCommentAccessGuard', () => {
  let guard: ReviewCommentAccessGuard;
  let reviewService: DeepMocked<ReviewService>;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

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
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        ReviewCommentAccessGuard
      ]
    }).compile();

    guard = module.get<ReviewCommentAccessGuard>(ReviewCommentAccessGuard);
    reviewService = module.get(ReviewService);
    workspaceUserService = module.get(WorkspaceUserService);
    reviewService.workspaceIdOf.mockResolvedValue(11);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should let a review login pass without asking for an access level', async () => {
    expect(await guard.canActivate(contextFor(reviewSession, { review_id: '2' }))).toBe(true);
    expect(workspaceUserService.canComment).not.toHaveBeenCalled();
  });

  it('should let a user pass who may comment in the review\'s workspace', async () => {
    workspaceUserService.canComment.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(loggedInUser, { review_id: '2' }))).toBe(true);
    expect(reviewService.workspaceIdOf).toHaveBeenCalledWith(2);
    expect(workspaceUserService.canComment).toHaveBeenCalledWith(7, 11);
  });

  it('should throw ForbiddenException for a user who may only read the workspace', async () => {
    workspaceUserService.canComment.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '2' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for a review that does not exist', async () => {
    reviewService.workspaceIdOf.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '999' })))
      .rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.canComment).not.toHaveBeenCalled();
  });
});
