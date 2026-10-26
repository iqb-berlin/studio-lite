import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { AccessLevelOrGroupAdminGuard } from './access-level-or-group-admin.guard';
import { AccessLevelCheck } from './access-level.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { AdminWorkspaceNotFoundException } from '../exceptions/admin-workspace-not-found.exception';

const hasLevel = jest.fn<ReturnType<AccessLevelCheck>, Parameters<AccessLevelCheck>>();

/** Asks the mock as its rung, so the tests decide whether the user holds it. */
class TestAccessLevelOrGroupAdminGuard extends AccessLevelOrGroupAdminGuard {
  constructor(authService: AuthService, workspaceService: WorkspaceService) {
    super(authService, workspaceService, hasLevel);
  }
}

describe('AccessLevelOrGroupAdminGuard', () => {
  let authService: DeepMocked<AuthService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let guard: TestAccessLevelOrGroupAdminGuard;

  const contextFor = (params: { workspace_id?: number }) => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 1 },
        params
      })
    })
  });

  beforeEach(() => {
    authService = createMock<AuthService>();
    workspaceService = createMock<WorkspaceService>();
    hasLevel.mockReset();
    hasLevel.mockResolvedValue(false);
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
    workspaceService.findOne.mockResolvedValue(createMock<WorkspaceFullDto>({ id: 10, groupId: 5 }));
    guard = new TestAccessLevelOrGroupAdminGuard(authService, workspaceService);
  });

  it('passes when the user holds the level, without asking whether they are an admin', async () => {
    hasLevel.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ workspace_id: 10 }))).toBe(true);
    expect(hasLevel).toHaveBeenCalledWith(1, 10);
    expect(authService.isAdminUser).not.toHaveBeenCalled();
  });

  it('passes for an administrator', async () => {
    authService.isAdminUser.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ workspace_id: 10 }))).toBe(true);
    expect(authService.isAdminUser).toHaveBeenCalledWith(1);
    expect(workspaceService.findOne).not.toHaveBeenCalled();
  });

  it('passes for the admin of the workspace group', async () => {
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ workspace_id: 10 }))).toBe(true);
    expect(workspaceService.findOne).toHaveBeenCalledWith(10);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 5);
  });

  it('throws ForbiddenException when no check passes', async () => {
    await expect(guard.canActivate(contextFor({ workspace_id: 10 }))).rejects.toThrow(ForbiddenException);
  });

  it('lets the not-found answer for an unknown workspace through', async () => {
    workspaceService.findOne.mockRejectedValue(new AdminWorkspaceNotFoundException(10, 'GET'));

    await expect(guard.canActivate(contextFor({ workspace_id: 10 }))).rejects.toThrow(AdminWorkspaceNotFoundException);
    expect(authService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException for a route without workspace_id, asking nothing', async () => {
    await expect(guard.canActivate(contextFor({}))).rejects.toThrow(ForbiddenException);
    expect(hasLevel).not.toHaveBeenCalled();
    expect(authService.isAdminUser).not.toHaveBeenCalled();
  });
});
