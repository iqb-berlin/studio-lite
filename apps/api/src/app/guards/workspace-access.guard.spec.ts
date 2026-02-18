import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceAccessGuard } from './workspace-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WorkspaceAccessGuard', () => {
  let guard: WorkspaceAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        WorkspaceAccessGuard
      ]
    }).compile();

    guard = module.get<WorkspaceAccessGuard>(WorkspaceAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.hasAccess returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.hasAccess.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.hasAccess).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw ForbiddenException if workspaceUserService.hasAccess returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.hasAccess.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.hasAccess).toHaveBeenCalledWith(userId, workspaceId);
  });
});
