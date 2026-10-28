import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { AdminUserController } from './admin-user-controller';
import { UsersService } from '../services/users.service';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let usersService: DeepMocked<UsersService>;
  let workspaceGroupService: DeepMocked<WorkspaceGroupService>;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    workspaceGroupService = createMock<WorkspaceGroupService>();
    authService = createMock<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: WorkspaceGroupService, useValue: workspaceGroupService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: authService }
      ]
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
  });

  describe('patch', () => {
    it('should update a user and leave their sessions alone', async () => {
      const dto = { id: 1, name: 'updated' } as UserFullDto;
      usersService.patch.mockResolvedValue(undefined);

      await controller.patch(1, dto);

      expect(usersService.patch).toHaveBeenCalledWith(1, dto);
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should end every session of the user when a password is set', async () => {
      const dto = { id: 1, password: 'new' } as UserFullDto;
      usersService.patch.mockResolvedValue(undefined);

      await controller.patch(1, dto);

      expect(usersService.patch).toHaveBeenCalledWith(1, dto);
      expect(authService.logout).toHaveBeenCalledWith(1);
    });

    it('should end no session when the user does not exist', async () => {
      const dto = { id: 1, password: 'new' } as UserFullDto;
      usersService.patch.mockRejectedValue(new Error('not found'));

      await expect(controller.patch(1, dto)).rejects.toThrow('not found');
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
