import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ManageAccessGuard } from './manage-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('ManageAccessGuard', () => {
  let guard: ManageAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        ManageAccessGuard
      ]
    }).compile();

    guard = module.get<ManageAccessGuard>(ManageAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.canManage returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canManage.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.canManage).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw ForbiddenException if workspaceUserService.canManage returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canManage.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.canManage).toHaveBeenCalledWith(userId, workspaceId);
  });
});
