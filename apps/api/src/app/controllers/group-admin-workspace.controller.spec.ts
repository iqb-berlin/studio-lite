import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  CreateWorkspaceDto,
  WorkspaceFullDto,
  WorkspaceUserInListDto,
  UserWorkspaceAccessDto, MoveToDto
} from '@studio-lite-lib/api-dto';
import { GroupAdminWorkspaceController } from './group-admin-workspace.controller';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import UserEntity from '../entities/user.entity';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

describe('GroupAdminWorkspaceController', () => {
  let controller: GroupAdminWorkspaceController;
  let workspaceService: DeepMocked<WorkspaceService>;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    workspaceService = createMock<WorkspaceService>();
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupAdminWorkspaceController],
      providers: [
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: UsersService, useValue: usersService },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<GroupAdminWorkspaceController>(GroupAdminWorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a workspace', async () => {
      const mockWorkspace = { id: 1, name: 'WS' } as WorkspaceFullDto;
      workspaceService.findOne.mockResolvedValue(mockWorkspace);

      const result = await controller.findOne(1);

      expect(result).toBe(mockWorkspace);
      expect(workspaceService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findOnesUsers', () => {
    it('should return users for a workspace', async () => {
      const mockUsers = [{ id: 1 }] as WorkspaceUserInListDto[];
      usersService.findAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.findOnesUsers(1);

      expect(result).toBe(mockUsers);
      expect(usersService.findAllUsers).toHaveBeenCalledWith(1);
    });
  });

  describe('patchOnesUsers', () => {
    it('should update users for a workspace', async () => {
      usersService.setUsersByWorkspace.mockResolvedValue(undefined as unknown as void);
      const dto = [{ workspaceId: 1, role: 'RW' }] as unknown as UserWorkspaceAccessDto[];

      await controller.patchOnesUsers(1, dto);

      expect(usersService.setUsersByWorkspace).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove workspaces of a group the user administers', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([7]);
      workspaceService.remove.mockResolvedValue(undefined);

      await controller.remove(1, [1, 2]);

      expect(workspaceService.remove).toHaveBeenCalledWith([1, 2]);
      expect(usersService.isWorkspaceGroupAdmin).toHaveBeenCalledTimes(1);
    });

    it('should refuse when one of the workspaces belongs to another group (#1005)', async () => {
      // The ids arrive in the query, where the guard does not look: without this check any group
      // admin deleted any workspace of the installation.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([7, 8]);
      usersService.isWorkspaceGroupAdmin.mockImplementation(
        async (userId: number, groupId?: number) => groupId === 7
      );

      await expect(controller.remove(1, [1, 2])).rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.remove).not.toHaveBeenCalled();
    });

    it('should not fail a group admin over an id that belongs to no workspace', async () => {
      // The route answers 200 for such an id and the e2e suite holds it to that; a workspace a
      // colleague deleted in the meantime must not take the whole request down with it.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([7]);
      workspaceService.remove.mockResolvedValue(undefined);

      await controller.remove(1, [1, 999]);

      expect(workspaceService.remove).toHaveBeenCalledWith([1, 999]);
    });

    it('should let an administrator remove any workspace without looking it up', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(true);
      workspaceService.remove.mockResolvedValue(undefined);

      await controller.remove(1, [1]);

      expect(workspaceService.remove).toHaveBeenCalledWith([1]);
      expect(workspaceService.findGroupIdsOfWorkspaces).not.toHaveBeenCalled();
      expect(usersService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
    });
  });

  describe('patchGroups', () => {
    it('should move workspaces to a target group the user administers', async () => {
      const user = { id: 1 } as UserEntity;
      const dto: MoveToDto = { ids: [10, 20], targetId: 2 };
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.patchWorkspaceGroups.mockResolvedValue(undefined);

      await controller.patchGroups(user, dto);

      expect(workspaceService.patchWorkspaceGroups).toHaveBeenCalledWith(dto.ids, dto.targetId, user);
    });

    it('should refuse a target group the user does not administer (#1005)', async () => {
      // The service checks the group the workspaces are moved OUT of; this is the one they are
      // moved INTO, and it stands in the body.
      const user = { id: 1 } as UserEntity;
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);

      await expect(controller.patchGroups(user, { ids: [10], targetId: 2 }))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.patchWorkspaceGroups).not.toHaveBeenCalled();
    });

    it('should refuse a body without a target group instead of asking about it', async () => {
      // Nothing validates the body, and isWorkspaceGroupAdmin without a group answers "administers
      // any group at all" -- the very fallback this change removes.
      const user = { id: 1 } as UserEntity;
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);

      await expect(controller.patchGroups(user, { ids: [10] } as MoveToDto))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(usersService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
      expect(workspaceService.patchWorkspaceGroups).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a workspace in a group the user administers', async () => {
      const dto = { name: 'new', groupId: 1 } as CreateWorkspaceDto;
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.create.mockResolvedValue(123);

      const result = await controller.create(1, dto);

      expect(result).toBe(123);
      expect(workspaceService.create).toHaveBeenCalledWith(dto);
      expect(usersService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 1);
    });

    it('should refuse a group the user does not administer (#1005)', async () => {
      // The group is in the body. Whoever administered any group at all created a workspace in
      // every other one before this check.
      const dto = { name: 'new', groupId: 2 } as CreateWorkspaceDto;
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);

      await expect(controller.create(1, dto)).rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.create).not.toHaveBeenCalled();
    });

    it('should refuse a body without a group instead of asking about it', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);

      await expect(controller.create(1, { name: 'new' } as CreateWorkspaceDto))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(usersService.isWorkspaceGroupAdmin).not.toHaveBeenCalled();
      expect(workspaceService.create).not.toHaveBeenCalled();
    });
  });
});
