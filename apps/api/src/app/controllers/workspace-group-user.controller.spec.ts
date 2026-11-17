import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UsersWorkspaceInListDto, UserWorkspaceAccessDto } from '@studio-lite-lib/api-dto';
import { WorkspaceGroupUserController } from './workspace-group-user.controller';
import { UsersService } from '../services/users.service';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ANY_WORKSPACE_GROUP_ADMIN_KEY } from '../decorators/any-workspace-group-admin.decorator';

describe('WorkspaceGroupUserController', () => {
  let controller: WorkspaceGroupUserController;
  let usersService: DeepMocked<UsersService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  const access: UserWorkspaceAccessDto[] = [{ id: 10, accessLevel: 3 }];

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    workspaceService = createMock<WorkspaceService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupUserController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<WorkspaceGroupUserController>(WorkspaceGroupUserController);
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953). The group
  // is in the path, so the guard asks about it; administering some other group must not do (#1005).
  it.each(['findAll', 'patch'] as const)('should let only admins of the group in the path reach %s', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceGroupUserController.prototype[method]))
      .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    expect(Reflect.getMetadata(ANY_WORKSPACE_GROUP_ADMIN_KEY, WorkspaceGroupUserController.prototype[method]))
      .toBeUndefined();
  });

  it('should answer with the workspaces of the user in the group of the path (#1650)', async () => {
    const workspaces = [{ id: 1, groupId: 2 }] as UsersWorkspaceInListDto[];
    workspaceService.findAllInGroup.mockResolvedValue(workspaces);

    expect(await controller.findAll(2, 5)).toBe(workspaces);
    expect(workspaceService.findAllInGroup).toHaveBeenCalledWith(5, 2);
  });

  describe('patch', () => {
    it('should write the access of the user in the group of the path', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([2]);

      await controller.patch(7, 2, 5, access);

      expect(workspaceService.setWorkspacesByUser).toHaveBeenCalledWith(5, 2, access);
    });

    it('should refuse a workspace that belongs to another group (#1005)', async () => {
      // The ids ride in the body and the service writes them unasked -- the group one administers
      // must not become the key to a workspace named beside it.
      usersService.getUserIsAdmin.mockResolvedValue(false);
      workspaceService.findGroupIdsOfWorkspaces.mockResolvedValue([8]);

      await expect(controller.patch(7, 2, 5, access)).rejects.toThrow(UserWorkspaceGroupNotAdminException);
      expect(workspaceService.setWorkspacesByUser).not.toHaveBeenCalled();
    });

    it('should let an administrator write without looking the workspaces up', async () => {
      // None of this is a question about an administrator, and the route answers a group id that
      // fits nothing with a 500 from the service, as it did before -- the e2e suite holds it there.
      usersService.getUserIsAdmin.mockResolvedValue(true);

      await controller.patch(1, 2, 5, access);

      expect(workspaceService.setWorkspacesByUser).toHaveBeenCalledWith(5, 2, access);
      expect(workspaceService.findGroupIdsOfWorkspaces).not.toHaveBeenCalled();
    });
  });
});
