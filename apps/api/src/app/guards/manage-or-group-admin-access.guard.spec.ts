import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ManageOrGroupAdminAccessGuard } from './manage-or-group-admin-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import Workspace from '../entities/workspace.entity';

describe('ManageOrGroupAdminAccessGuard', () => {
  let guard: ManageOrGroupAdminAccessGuard;
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
        ManageOrGroupAdminAccessGuard
      ]
    }).compile();

    guard = module.get<ManageOrGroupAdminAccessGuard>(ManageOrGroupAdminAccessGuard);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no params', async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1 },
            params: {}
          })
        })
      });
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should allow if workspaceUser has manage access', async () => {
      workspaceUserService.canManage.mockResolvedValue(true);
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1 },
            params: { workspace_id: 10 }
          })
        })
      });
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow if user is super admin', async () => {
      workspaceUserService.canManage.mockResolvedValue(false);
      authService.isAdminUser.mockResolvedValue(true);
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1 },
            params: { workspace_id: 10 }
          })
        })
      });
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow if user is group admin', async () => {
      workspaceUserService.canManage.mockResolvedValue(false);
      authService.isAdminUser.mockResolvedValue(false);
      authService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findOne.mockResolvedValue(createMock<Workspace>({ groupId: 2 }));

      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1 },
            params: { workspace_id: 10 }
          })
        })
      });
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
