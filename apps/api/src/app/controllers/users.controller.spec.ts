import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserFullDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { ANY_WORKSPACE_GROUP_ADMIN_KEY } from '../decorators/any-workspace-group-admin.decorator';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: DeepMocked<UsersService>;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    authService = createMock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: WorkspaceGroupService, useValue: createMock<WorkspaceGroupService>() },
        { provide: AuthService, useValue: authService },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953). No group
  // stands in the path, so the route has to say that administering any group is enough.
  it('should let in whoever administers the installation or any group', () => {
    expect(Reflect.getMetadata('__guards__', UsersController.prototype.findAll))
      .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    expect(Reflect.getMetadata(ANY_WORKSPACE_GROUP_ADMIN_KEY, UsersController.prototype.findAll)).toBe(true);
  });

  describe('findAll', () => {
    it('should return all users if full is false', async () => {
      const mockUsers = [{ id: 1, name: 'U1' }] as WorkspaceUserInListDto[];
      usersService.findAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.findAll(false);

      expect(result).toBe(mockUsers);
      expect(usersService.findAllUsers).toHaveBeenCalled();
    });

    it('should return all full users if full is true', async () => {
      const mockUsers = [{ id: 1, name: 'U1', isLoggedIn: true }] as UserFullDto[];
      usersService.findAllFull.mockResolvedValue(mockUsers);

      const result = await controller.findAll(true);

      expect(result).toEqual(mockUsers);
      expect(usersService.findAllFull).toHaveBeenCalled();
    });
  });

  it.each([
    'findAdministeredGroups',
    'patchAdministeredGroups',
    'remove',
    'create',
    'patch',
    'removeSession',
    'removeOrphanedSessions'
  ] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', UsersController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );

  // The administrator calling is 9; the account changed is 1.
  describe('patch', () => {
    it('should update a user and leave their sessions alone', async () => {
      const dto = { id: 1, name: 'updated' } as UserFullDto;
      usersService.patch.mockResolvedValue(undefined);

      await controller.patch(9, 1, dto);

      expect(usersService.patch).toHaveBeenCalledWith(1, dto, 9);
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should end every session of the user when a password is set', async () => {
      const dto = { id: 1, password: 'new' } as UserFullDto;
      usersService.patch.mockResolvedValue(undefined);

      await controller.patch(9, 1, dto);

      expect(usersService.patch).toHaveBeenCalledWith(1, dto, 9);
      expect(authService.logout).toHaveBeenCalledWith(1);
    });

    it('should end no session when the user does not exist', async () => {
      const dto = { id: 1, password: 'new' } as UserFullDto;
      usersService.patch.mockRejectedValue(new Error('not found'));

      await expect(controller.patch(9, 1, dto)).rejects.toThrow('not found');
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('removeSession', () => {
    it('should remove a specific orphaned user session', async () => {
      authService.logoutOrphanedSession.mockResolvedValue(true);

      await controller.removeSession(1, 'session-1');

      expect(authService.logoutOrphanedSession).toHaveBeenCalledWith(1, 'session-1');
    });

    it('should reject non-orphaned session deletion', async () => {
      authService.logoutOrphanedSession.mockResolvedValue(false);

      await expect(controller.removeSession(1, 'session-1')).rejects.toThrow('Only orphaned sessions can be deleted.');
    });
  });
});
