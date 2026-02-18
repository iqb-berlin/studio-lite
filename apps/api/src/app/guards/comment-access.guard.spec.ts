import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommentAccessGuard } from './comment-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('CommentAccessGuard', () => {
  let guard: CommentAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        CommentAccessGuard
      ]
    }).compile();

    guard = module.get<CommentAccessGuard>(CommentAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.canComment returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canComment.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.canComment).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw ForbiddenException if workspaceUserService.canComment returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canComment.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.canComment).toHaveBeenCalledWith(userId, workspaceId);
  });
});
