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
    it('should remove workspaces', async () => {
      workspaceService.remove.mockResolvedValue(undefined);

      await controller.remove([1, 2]);

      expect(workspaceService.remove).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('patchGroups', () => {
    it('should move workspaces to a target group', async () => {
      const user = { id: 1 } as UserEntity;
      const dto: MoveToDto = { ids: [10, 20], targetId: 2 };
      workspaceService.patchWorkspaceGroups.mockResolvedValue(undefined);

      await controller.patchGroups(user, dto);

      expect(workspaceService.patchWorkspaceGroups).toHaveBeenCalledWith(dto.ids, dto.targetId, user);
    });
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      const dto = { name: 'new', groupId: 1 } as CreateWorkspaceDto;
      workspaceService.create.mockResolvedValue(123);

      const result = await controller.create(dto);

      expect(result).toBe(123);
      expect(workspaceService.create).toHaveBeenCalledWith(dto);
    });
  });
});
