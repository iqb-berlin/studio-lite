import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceGroupAccessGuard } from './workspace-group-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WorkspaceGroupAccessGuard', () => {
  let guard: WorkspaceGroupAccessGuard;
  let authService: DeepMocked<AuthService>;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  const contextFor = (
    userId: number,
    params: Record<string, string>,
    query: Record<string, string> = {}
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId }, params, query })
    })
  });

  beforeEach(() => {
    authService = createMock<AuthService>();
    workspaceUserService = createMock<WorkspaceUserService>();
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
    workspaceUserService.hasAccessToWorkspaceGroup.mockResolvedValue(false);
    guard = new WorkspaceGroupAccessGuard(authService, workspaceUserService);
  });

  it('should let the group admin (or an administrator) read the group and its report', async () => {
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(3, { workspace_group_id: '7' }))).toBe(true);
    expect(await guard.canActivate(contextFor(3, { workspace_group_id: '7' }, { download: 'true' }))).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(3, 7);
  });

  it('should let a member of a workspace of the group read the group', async () => {
    workspaceUserService.hasAccessToWorkspaceGroup.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(3, { workspace_group_id: '7' }))).toBe(true);
    expect(workspaceUserService.hasAccessToWorkspaceGroup).toHaveBeenCalledWith(3, 7);
  });

  // The report lists every workspace of the group; it is group administration, not membership.
  it('should refuse the report to a member who does not administer the group', async () => {
    workspaceUserService.hasAccessToWorkspaceGroup.mockResolvedValue(true);

    await expect(guard.canActivate(contextFor(3, { workspace_group_id: '7' }, { download: 'true' })))
      .rejects.toThrow(ForbiddenException);
  });

  // The controller takes any non-empty `download` for a download; the guard must read it alike.
  it('should treat download=false as the report, as the controller does', async () => {
    workspaceUserService.hasAccessToWorkspaceGroup.mockResolvedValue(true);

    await expect(guard.canActivate(contextFor(3, { workspace_group_id: '7' }, { download: 'false' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should refuse a user with no workspace in the group', async () => {
    await expect(guard.canActivate(contextFor(3, { workspace_group_id: '7' })))
      .rejects.toThrow(ForbiddenException);
  });

  // Without a group the admin check would turn into "administers any group at all".
  it('should refuse a route without a group, before asking about any group', async () => {
    await expect(guard.canActivate(contextFor(3, {}))).rejects.toThrow(ForbiddenException);
    expect(authService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
  });

  it('should refuse a review session, which carries no user id', async () => {
    await expect(guard.canActivate(contextFor(0, { workspace_group_id: '7' })))
      .rejects.toThrow(ForbiddenException);
    expect(authService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
  });
});
