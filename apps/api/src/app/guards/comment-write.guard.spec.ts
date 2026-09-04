import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitCommentDto } from '@studio-lite-lib/api-dto';
import { CommentWriteGuard } from './comment-write.guard';
import { UnitCommentService } from '../services/unit-comment.service';

describe('CommentWriteGuard', () => {
  let guard: CommentWriteGuard;
  let unitCommentService: DeepMocked<UnitCommentService>;

  const contextFor = (
    userId: number,
    params: Record<string, string>,
    body: Record<string, unknown> = {}
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId }, params, body })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        CommentWriteGuard
      ]
    }).compile();

    guard = module.get<CommentWriteGuard>(CommentWriteGuard);
    unitCommentService = module.get(UnitCommentService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if the comment belongs to the requesting user', async () => {
    unitCommentService.findOneComment.mockResolvedValue({ id: 42, userId: 1 } as UnitCommentDto);

    expect(await guard.canActivate(contextFor(1, { id: '42' }))).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(42);
  });

  it('should read the comment id from comment_id as well', async () => {
    unitCommentService.findOneComment.mockResolvedValue({ id: 42, userId: 1 } as UnitCommentDto);

    expect(await guard.canActivate(contextFor(1, { comment_id: '42' }))).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(42);
  });

  it('should throw UnauthorizedException for a comment of another user', async () => {
    unitCommentService.findOneComment.mockResolvedValue({ id: 42, userId: 2 } as UnitCommentDto);

    await expect(guard.canActivate(contextFor(1, { id: '42' }))).rejects.toThrow(UnauthorizedException);
  });

  it('should ignore a userId claimed in the body', async () => {
    unitCommentService.findOneComment.mockResolvedValue({ id: 42, userId: 2 } as UnitCommentDto);

    // What used to be enough: naming yourself as the author of someone else's comment.
    await expect(guard.canActivate(contextFor(1, { id: '42' }, { userId: 1 })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for a review session, which owns no comment', async () => {
    await expect(guard.canActivate(contextFor(0, { id: '42' }))).rejects.toThrow(UnauthorizedException);
    expect(unitCommentService.findOneComment).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException without a comment in the route', async () => {
    await expect(guard.canActivate(contextFor(1, {}))).rejects.toThrow(UnauthorizedException);
  });
});
