import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WriteAccessGuard } from './write-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WriteAccessGuard', () => {
  let guard: WriteAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        WriteAccessGuard
      ]
    }).compile();

    guard = module.get<WriteAccessGuard>(WriteAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.canWrite returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canWrite.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.canWrite).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw ForbiddenException if workspaceUserService.canWrite returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    workspaceUserService.canWrite.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(workspaceUserService.canWrite).toHaveBeenCalledWith(userId, workspaceId);
  });
});
