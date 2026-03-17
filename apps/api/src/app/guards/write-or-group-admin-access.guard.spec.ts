import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WriteOrGroupAdminAccessGuard } from './write-or-group-admin-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WriteOrGroupAdminAccessGuard', () => {
  let guard: WriteOrGroupAdminAccessGuard;
  let authService: DeepMocked<AuthService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

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
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        WriteOrGroupAdminAccessGuard
      ]
    }).compile();

    guard = module.get<WriteOrGroupAdminAccessGuard>(WriteOrGroupAdminAccessGuard);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if workspaceUserService.canWrite is true', async () => {
    workspaceUserService.canWrite.mockResolvedValue(true);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: { workspace_id: 10 }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceUserService.canWrite).toHaveBeenCalledWith(1, 10);
  });

  it('should return true if authService.isAdminUser is true', async () => {
    workspaceUserService.canWrite.mockResolvedValue(false);
    authService.isAdminUser.mockResolvedValue(true);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: { workspace_id: 10 }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(authService.isAdminUser).toHaveBeenCalledWith(1);
  });

  it('should return true if authService.isWorkspaceGroupAdmin is true', async () => {
    workspaceUserService.canWrite.mockResolvedValue(false);
    authService.isAdminUser.mockResolvedValue(false);
    workspaceService.findOne.mockResolvedValue({ id: 10, groupId: 5 } as unknown as never);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: { workspace_id: 10 }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(workspaceService.findOne).toHaveBeenCalledWith(10);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 5);
  });

  it('should throw UnauthorizedException if all checks fail', async () => {
    workspaceUserService.canWrite.mockResolvedValue(false);
    authService.isAdminUser.mockResolvedValue(false);
    workspaceService.findOne.mockResolvedValue({ id: 10, groupId: 5 } as unknown as never);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: { workspace_id: 10 }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if workspace_id is missing', async () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: {}
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
