import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { CommentWriteGuard } from './comment-write.guard';

describe('CommentWriteGuard', () => {
  let guard: CommentWriteGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentWriteGuard]
    }).compile();

    guard = module.get<CommentWriteGuard>(CommentWriteGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if current userId matches body userId', async () => {
    const userId = 1;
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          body: { userId: userId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if current userId does not match body userId', async () => {
    const userId = 1;
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          body: { userId: 2 }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
