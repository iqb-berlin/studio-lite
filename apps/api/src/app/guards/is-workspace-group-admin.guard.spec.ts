import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { IsWorkspaceGroupAdminGuard } from './is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';

describe('IsWorkspaceGroupAdminGuard', () => {
  let guard: IsWorkspaceGroupAdminGuard;
  let authService: DeepMocked<AuthService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let reflector: DeepMocked<Reflector>;

  const contextFor = (userId: number, params: Record<string, unknown>): ExecutionContext => createMock<
    ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: userId },
        params
      })
    })
  });

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
          provide: Reflector,
          useValue: createMock<Reflector>()
        },
        IsWorkspaceGroupAdminGuard
      ]
    }).compile();

    guard = module.get<IsWorkspaceGroupAdminGuard>(IsWorkspaceGroupAdminGuard);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
    reflector = module.get(Reflector);
    reflector.getAllAndOverride.mockReturnValue(undefined);
  });

  it('should return true if user is global admin', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(userId, {}))).toBe(true);
    expect(authService.isAdminUser).toHaveBeenCalledWith(userId);
  });

  it('should return true if user is group admin of workspace_id', async () => {
    const userId = 1;
    const groupId = 2;
    authService.isAdminUser.mockResolvedValue(false);
    workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([groupId]);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(userId, { workspace_id: '5' }))).toBe(true);
    expect(workspaceService.findGroupIdsOfWorkspaces).toHaveBeenCalledWith([5]);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, groupId);
  });

  // A 404 for an unknown id beside the 403 for a foreign one told anyone which ids exist (#2023).
  // On a marked route the unknown workspace must not fall back to "administers any group".
  it.each([[undefined], [true]])(
    'should refuse a workspace that does not exist like a foreign one, the route marked: %s',
    async marked => {
      authService.isAdminUser.mockResolvedValue(false);
      authService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([]);
      reflector.getAllAndOverride.mockReturnValue(marked);

      await expect(guard.canActivate(contextFor(1, { workspace_id: '9988' }))).rejects.toThrow(ForbiddenException);
      expect(authService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
    }
  );

  it('should return true if user is group admin of workspace_group_id', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(userId, { workspace_group_id: '2' }))).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, 2);
  });

  it('should throw ForbiddenException if user is not group admin', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(userId, { workspace_group_id: '2' })))
      .rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if the route names no group and is not marked', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    // The admin of some other group: before the marking was required, this passed.
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    await expect(guard.canActivate(contextFor(userId, {}))).rejects.toThrow(ForbiddenException);
    expect(authService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
  });

  it('should ask for any group admin if the route names no group and is marked', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(await guard.canActivate(contextFor(userId, {}))).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId);
  });

  it('should throw ForbiddenException on a marked route if the user administers no group', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(contextFor(userId, {}))).rejects.toThrow(ForbiddenException);
  });
});
