import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DeleteAccessGuard } from './delete-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('DeleteAccessGuard', () => {
  let guard: DeleteAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        DeleteAccessGuard
      ]
    }).compile();

    guard = module.get<DeleteAccessGuard>(DeleteAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.canDelete returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canDelete.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.canDelete).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw ForbiddenException if workspaceUserService.canDelete returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canDelete.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.canDelete).toHaveBeenCalledWith(userId, workspaceId);
  });
});
