import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
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

  it('should be defined', () => {
    expect(guard).toBeDefined();
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
    workspaceService.findOne.mockResolvedValue({ groupId } as WorkspaceFullDto);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(userId, { workspace_id: '5' }))).toBe(true);
    expect(workspaceService.findOne).toHaveBeenCalledWith(5);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, groupId);
  });

  it('should return true if user is group admin of workspace_group_id', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(userId, { workspace_group_id: '2' }))).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(userId, 2);
  });

  it('should throw UnauthorizedException if user is not group admin', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(userId, { workspace_group_id: '2' })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if the route names no group and is not marked', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    // The admin of some other group: before the marking was required, this passed.
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    await expect(guard.canActivate(contextFor(userId, {}))).rejects.toThrow(UnauthorizedException);
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

  it('should throw UnauthorizedException on a marked route if the user administers no group', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(contextFor(userId, {}))).rejects.toThrow(UnauthorizedException);
  });
});
