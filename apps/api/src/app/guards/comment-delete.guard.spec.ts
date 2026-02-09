import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitCommentDto } from '@studio-lite-lib/api-dto';
import { CommentDeleteGuard } from './comment-delete.guard';
import { UnitCommentService } from '../services/unit-comment.service';

describe('CommentDeleteGuard', () => {
  let guard: CommentDeleteGuard;
  let unitCommentService: DeepMocked<UnitCommentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        CommentDeleteGuard
      ]
    }).compile();

    guard = module.get<CommentDeleteGuard>(CommentDeleteGuard);
    unitCommentService = module.get(UnitCommentService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if current userId matches comment userId', async () => {
    const userId = 1;
    const commentId = 'c1';
    unitCommentService.findOneComment.mockResolvedValue({
      userId
    } as UnitCommentDto);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { id: commentId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(commentId);
  });

  it('should throw UnauthorizedException if current userId does not match comment userId', async () => {
    const userId = 1;
    const commentId = 'c1';
    unitCommentService.findOneComment.mockResolvedValue({
      userId: 2
    } as UnitCommentDto);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { id: commentId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(commentId);
  });
});
