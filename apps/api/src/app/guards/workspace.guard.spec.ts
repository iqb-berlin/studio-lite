import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceGuard } from './workspace.guard';
import { AuthService } from '../services/auth.service';

describe('WorkspaceGuard', () => {
  let workspaceGuard: WorkspaceGuard;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        }
      ]
    }).compile();
    authService = module.get(AuthService);
    workspaceGuard = new WorkspaceGuard(authService);
  });

  it('should be defined', () => {
    expect(workspaceGuard).toBeDefined();
  });

  it('should return true if authService.canAccessWorkSpace returns true', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    authService.canAccessWorkSpace.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    expect(await workspaceGuard.canActivate(context)).toBe(true);
    expect(authService.canAccessWorkSpace).toHaveBeenCalledWith(userId, workspaceId);
  });

  it('should throw UnauthorizedException if authService.canAccessWorkSpace returns false', async () => {
    const userId = 1;
    const workspaceId = 'w1';
    authService.canAccessWorkSpace.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { workspace_id: workspaceId }
        })
      })
    });

    await expect(workspaceGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(authService.canAccessWorkSpace).toHaveBeenCalledWith(userId, workspaceId);
  });
});
