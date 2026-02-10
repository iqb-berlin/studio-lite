import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { IsWorkspaceGroupAdminGuard } from './is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';

describe('IsWorkspaceGroupAdminGuard', () => {
  let guard: IsWorkspaceGroupAdminGuard;
  let authService: DeepMocked<AuthService>;
  let workspaceService: DeepMocked<WorkspaceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        IsWorkspaceGroupAdminGuard
      ]
    }).compile();

    guard = module.get<IsWorkspaceGroupAdminGuard>(IsWorkspaceGroupAdminGuard);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is global admin', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(authService.isAdminUser).toHaveBeenCalledWith(userId);
  });

  it('should return true if user is group admin of workspace_id', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    const groupId = 2;
    authService.isAdminUser.mockResolvedValue(false);
    workspaceService.findOne.mockResolvedValue({ groupId } as WorkspaceFullDto);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceService.findOne).toHaveBeenCalledWith(workspaceId);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, groupId);
  });

  it('should return true if user is group admin of workspace_group_id', async () => {
    const userId = 1;
    const workspaceGroupId = 2;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_group_id: workspaceGroupId }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, workspaceGroupId);
  });

  it('should throw UnauthorizedException if user is not group admin', async () => {
    const userId = 1;
    const workspaceGroupId = 2;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_group_id: workspaceGroupId }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
