import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserFullDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
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

  beforeEach(async () => {
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() },
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
});
