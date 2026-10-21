import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitCommentDto } from '@studio-lite-lib/api-dto';
import { ReviewCommentOwnerGuard } from './review-comment-owner.guard';
import { UnitCommentService } from '../services/unit-comment.service';

describe('ReviewCommentOwnerGuard', () => {
  let guard: ReviewCommentOwnerGuard;
  let unitCommentService: DeepMocked<UnitCommentService>;

  const contextFor = (
    user: { id: number, reviewId: number },
    params: Record<string, string> = { review_id: '2', unit_id: '5', comment_id: '9' }
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user, params })
    })
  });

  const reviewSession = { id: 0, reviewId: 2 };
  const loggedInUser = { id: 7, reviewId: 0 };
  const commentBy = (userId: number | null) => unitCommentService.findOneComment
    .mockResolvedValue({ id: 9, userId } as unknown as UnitCommentDto);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        ReviewCommentOwnerGuard
      ]
    }).compile();

    guard = module.get<ReviewCommentOwnerGuard>(ReviewCommentOwnerGuard);
    unitCommentService = module.get(UnitCommentService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should let a user pass on their own comment', async () => {
    commentBy(7);

    expect(await guard.canActivate(contextFor(loggedInUser))).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(9);
  });

  it('should throw ForbiddenException for a user on someone else\'s comment', async () => {
    commentBy(8);

    await expect(guard.canActivate(contextFor(loggedInUser))).rejects.toThrow(ForbiddenException);
  });

  it('should let a review login pass on a comment written without an account', async () => {
    commentBy(null);

    expect(await guard.canActivate(contextFor(reviewSession))).toBe(true);
  });

  it('should throw ForbiddenException for a review login on a user\'s comment', async () => {
    commentBy(7);

    await expect(guard.canActivate(contextFor(reviewSession))).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException without a comment in the route', async () => {
    await expect(guard.canActivate(contextFor(loggedInUser, { review_id: '2', unit_id: '5' })))
      .rejects.toThrow(ForbiddenException);
    expect(unitCommentService.findOneComment).not.toHaveBeenCalled();
  });
});
