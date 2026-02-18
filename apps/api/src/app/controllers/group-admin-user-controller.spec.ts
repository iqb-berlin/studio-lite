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
      const mockUsers = [{ id: 1, name: 'U1' }] as UserFullDto[];
      usersService.findAllFull.mockResolvedValue(mockUsers);

      const result = await controller.findAll(true);

      expect(result).toBe(mockUsers);
      expect(usersService.findAllFull).toHaveBeenCalled();
    });
  });

  describe('patchOnesWorkspaces', () => {
    it('should update workspaces for a user in a group', async () => {
      const dto = {
        groupId: 1,
        workspaces: [{ workshopId: 10, role: 'RW' }]
      } as unknown as UserWorkspaceAccessForGroupDto;
      workspaceService.setWorkspacesByUser.mockResolvedValue(undefined as unknown as void);

      await controller.patchOnesWorkspaces(1, dto);

      expect(workspaceService.setWorkspacesByUser).toHaveBeenCalledWith(1, 1, dto.workspaces);
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
