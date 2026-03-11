import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ReadOrGroupAdminAccessGuard } from './read-or-group-admin-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('ReadOrGroupAdminAccessGuard', () => {
  let guard: ReadOrGroupAdminAccessGuard;
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
        ReadOrGroupAdminAccessGuard
      ]
    }).compile();

    guard = module.get<ReadOrGroupAdminAccessGuard>(ReadOrGroupAdminAccessGuard);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should return true if workspaceUserService.hasAccess is true', async () => {
    workspaceUserService.hasAccess.mockResolvedValue(true);
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1 },
          params: { workspace_id: 10 }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should return true if authService.isAdminUser is true', async () => {
    workspaceUserService.hasAccess.mockResolvedValue(false);
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
  });

  it('should return true if authService.isWorkspaceGroupAdmin is true', async () => {
    workspaceUserService.hasAccess.mockResolvedValue(false);
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
  });

  it('should throw UnauthorizedException if all checks fail', async () => {
    workspaceUserService.hasAccess.mockResolvedValue(false);
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
});
