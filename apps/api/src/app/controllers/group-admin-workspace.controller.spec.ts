import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateWorkspaceDto, MoveToDto } from '@studio-lite-lib/api-dto';
import { GroupAdminWorkspaceController } from './group-admin-workspace.controller';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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

  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['findOne', 'findOnesUsers', 'patchOnesUsers', 'remove', 'patchGroups', 'create'] as const)(
    'should let only admins of the group reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', GroupAdminWorkspaceController.prototype[method]))
        .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    }
  );

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
    it('should move workspaces between groups the user administers', async () => {
      const dto: MoveToDto = { ids: [10, 20], targetId: 2 };
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([7]);
      workspaceService.patchWorkspaceGroups.mockResolvedValue(undefined);

      await controller.patchGroups(1, dto);

      expect(usersService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 2);
      expect(usersService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 7);
      expect(workspaceService.findGroupIdsOfWorkspaces).toHaveBeenCalledWith(dto.ids);
      expect(workspaceService.patchWorkspaceGroups).toHaveBeenCalledWith(dto.ids, dto.targetId);
    });

    it('should refuse a target group the user does not administer (#1005)', async () => {
      // The target group stands in the body, where the guard does not look.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);

      await expect(controller.patchGroups(1, { ids: [10], targetId: 2 }))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.patchWorkspaceGroups).not.toHaveBeenCalled();
    });

    it('should refuse workspaces of a group the user does not administer before moving any (#1984)', async () => {
      // Moving resets the states of the units, so the refusal has to come before the service.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin
        .mockImplementation((_userId: number, groupId: number) => Promise.resolve(groupId === 2));
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([7]);

      await expect(controller.patchGroups(1, { ids: [10], targetId: 2 }))
        .rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.patchWorkspaceGroups).not.toHaveBeenCalled();
    });

    it('should let an administrator move workspaces between any groups (#1984)', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(true);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);

      await controller.patchGroups(1, { ids: [10], targetId: 2 });

      expect(workspaceService.patchWorkspaceGroups).toHaveBeenCalledWith([10], 2);
    });

    it('should refuse a body without a target group instead of asking about it', async () => {
      // Nothing validates the body, and isWorkspaceGroupAdmin without a group answers "administers
      // any group at all" -- the very fallback this change removes.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);

      await expect(controller.patchGroups(1, { ids: [10] } as MoveToDto))
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

    // An administrator is not entered as admin of every group, and needs not be.
    it('should let an administrator create a workspace in any group', async () => {
      const dto = { name: 'new', groupId: 2 } as CreateWorkspaceDto;
      usersService.getUserIsAdmin.mockResolvedValue(true);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(false);
      workspaceService.create.mockResolvedValue(124);

      expect(await controller.create(1, dto)).toBe(124);
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
