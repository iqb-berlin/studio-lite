import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { StreamableFile } from '@nestjs/common';
import {
  CreateWorkspaceGroupDto, UnitInViewDto, UserInListDto,
  WorkspaceGroupFullDto, WorkspaceGroupInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { AdminWorkspaceGroupController } from './admin-workspace-group.controller';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { UsersService } from '../services/users.service';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { UnitItemService } from '../services/unit-item.service';

describe('AdminWorkspaceGroupController', () => {
  let controller: AdminWorkspaceGroupController;
  let workspaceGroupService: DeepMocked<WorkspaceGroupService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let unitService: DeepMocked<UnitService>;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    workspaceGroupService = createMock<WorkspaceGroupService>();
    workspaceService = createMock<WorkspaceService>();
    unitService = createMock<UnitService>();
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWorkspaceGroupController],
      providers: [
        { provide: WorkspaceGroupService, useValue: workspaceGroupService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: UnitService, useValue: unitService },
        { provide: UsersService, useValue: usersService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: UnitItemService, useValue: createMock<UnitItemService>() }
      ]
    }).compile();

    controller = module.get<AdminWorkspaceGroupController>(AdminWorkspaceGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all workspace groups if download is false', async () => {
      const mockGroups = [{ id: 1, name: 'G1' }] as WorkspaceGroupInListDto[];
      workspaceGroupService.findAll.mockResolvedValue(mockGroups);

      const result = await controller.findAll(false, createMock<Response>());

      expect(result).toBe(mockGroups);
      expect(workspaceGroupService.findAll).toHaveBeenCalled();
    });

    it('should return a StreamableFile if download is true', async () => {
      const mockRes = createMock<Response>();
      const mockBuffer = Buffer.from('test');
      jest.spyOn(DownloadWorkspacesClass, 'getWorkspaceReport').mockResolvedValue(mockBuffer);

      const result = await controller.findAll(true, mockRes);

      expect(result).toBeInstanceOf(StreamableFile);
      expect(mockRes.set).toHaveBeenCalled();
      expect(DownloadWorkspacesClass.getWorkspaceReport).toHaveBeenCalled();
    });
  });

  describe('findAllUnits', () => {
    it('should return all units', async () => {
      const mockUnits = [{ id: 1, key: 'K1', workspaceId: 1 } as unknown as UnitInViewDto];
      unitService.findAll.mockResolvedValue(mockUnits);

      const result = await controller.findAllUnits();

      expect(result).toBe(mockUnits);
      expect(unitService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single workspace group', async () => {
      const mockGroup = { id: 1, name: 'G1' } as WorkspaceGroupFullDto;
      workspaceGroupService.findOne.mockResolvedValue(mockGroup);

      const result = await controller.findOne(1);

      expect(result).toBe(mockGroup);
      expect(workspaceGroupService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findOnesWorkspaces', () => {
    it('should return workspaces for a group', async () => {
      const mockWorkspaces = [{ id: 1 }] as WorkspaceInListDto[];
      workspaceService.findAllByGroup.mockResolvedValue(mockWorkspaces);

      const result = await controller.findOnesWorkspaces(1);

      expect(result).toBe(mockWorkspaces);
      expect(workspaceService.findAllByGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove workspace groups', async () => {
      workspaceGroupService.remove.mockResolvedValue(undefined);

      await controller.remove([1, 2]);

      expect(workspaceGroupService.remove).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('findWorkspaceGroupUnits', () => {
    it('should return units for a workspace group', async () => {
      const mockUnits = [{ id: 1, key: 'K1', workspaceId: 1 } as unknown as UnitInViewDto];
      unitService.findAllForGroup.mockResolvedValue(mockUnits);

      const result = await controller.findWorkspaceGroupUnits(1);

      expect(result).toBe(mockUnits);
      expect(unitService.findAllForGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('patch', () => {
    it('should update a workspace group', async () => {
      const dto = { id: 1, name: 'updated' } as WorkspaceGroupFullDto;
      workspaceGroupService.patch.mockResolvedValue(undefined as unknown as void);

      await controller.patch(1, dto);

      expect(workspaceGroupService.patch).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('create', () => {
    it('should create a workspace group and return its id', async () => {
      const dto = { name: 'new' } as CreateWorkspaceGroupDto;
      workspaceGroupService.create.mockResolvedValue(123);

      const result = await controller.create(dto);

      expect(result).toBe(123);
      expect(workspaceGroupService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOnesAdmins', () => {
    it('should return admins for a group', async () => {
      const mockAdmins = [{ id: 1 }] as UserInListDto[];
      usersService.findAllWorkspaceGroupAdmins.mockResolvedValue(mockAdmins);

      const result = await controller.findOnesAdmins(1);

      expect(result).toBe(mockAdmins);
      expect(usersService.findAllWorkspaceGroupAdmins).toHaveBeenCalledWith(1);
    });
  });

  describe('patchOnesAdmins', () => {
    it('should update admins for a group', async () => {
      usersService.setWorkspaceGroupAdmins.mockResolvedValue(undefined as unknown as void);

      await controller.patchOnesAdmins(1, [10, 20]);

      expect(usersService.setWorkspaceGroupAdmins).toHaveBeenCalledWith(1, [10, 20]);
    });
  });
});
