import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  UserFullDto, UsersWorkspaceInListDto,
  UserWorkspaceAccessForGroupDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import { GroupAdminUserController } from './group-admin-user-controller';
import { UsersService } from '../services/users.service';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

describe('GroupAdminUserController', () => {
  let controller: GroupAdminUserController;
  let usersService: DeepMocked<UsersService>;
  let workspaceService: DeepMocked<WorkspaceService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    workspaceService = createMock<WorkspaceService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupAdminUserController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<GroupAdminUserController>(GroupAdminUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  describe('patchOnesWorkspaces', () => {
    const accessInGroup = (groupId: number): UserWorkspaceAccessForGroupDto => ({
      groupId,
      workspaces: [{ id: 10, accessLevel: 3 }]
    });

    it('should update workspaces for a user in a group the caller administers', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([1]);
      workspaceService.setWorkspacesByUser.mockResolvedValue(undefined as unknown as void);

      const dto = accessInGroup(1);
      await controller.patchOnesWorkspaces(7, 1, dto);

      expect(workspaceService.setWorkspacesByUser).toHaveBeenCalledWith(1, 1, dto.workspaces);
    });

    it('should refuse a group the caller does not administer (#1005)', async () => {
      // The group stands in the body and the path names a user, so the guard cannot ask: whoever
      // administered any group at all wrote access rights into every other one.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);

      await expect(controller.patchOnesWorkspaces(7, 1, accessInGroup(2)))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.setWorkspacesByUser).not.toHaveBeenCalled();
    });

    it('should refuse a workspace that belongs to another group (#1005)', async () => {
      // The ids ride in the same body and the service writes them unasked -- the group one
      // administers must not become the key to a workspace named beside it.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([8]);

      await expect(controller.patchOnesWorkspaces(7, 1, accessInGroup(1)))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.setWorkspacesByUser).not.toHaveBeenCalled();
    });

    it('should refuse a body without a group instead of asking about it', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);

      await expect(controller.patchOnesWorkspaces(7, 1, { workspaces: [] } as UserWorkspaceAccessForGroupDto))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(usersService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
      expect(workspaceService.setWorkspacesByUser).not.toHaveBeenCalled();
    });

    it('should let an administrator write into any group without checking the workspaces', async () => {
      // None of this is a question about an administrator, and the route answers a group id that
      // fits nothing with a 500 from the service, as it did before -- the e2e suite holds it there.
      usersService.getUserIsAdmin.mockResolvedValue(true);
      workspaceService.setWorkspacesByUser.mockResolvedValue(undefined as unknown as void);

      await controller.patchOnesWorkspaces(7, 1, accessInGroup(2));

      expect(workspaceService.setWorkspacesByUser).toHaveBeenCalled();
      expect(usersService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
      expect(workspaceService.findGroupIdsOfWorkspaces).not.toHaveBeenCalled();
    });
  });

  describe('findOnesWorkspaces', () => {
    it('should return workspaces for a user', async () => {
      const mockWorkspaces = [{ id: 1 }] as UsersWorkspaceInListDto[];
      workspaceService.findAll.mockResolvedValue(mockWorkspaces);

      const result = await controller.findOnesWorkspaces(1);

      expect(result).toBe(mockWorkspaces);
      expect(workspaceService.findAll).toHaveBeenCalledWith(1);
    });
  });
});
