import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { StreamableFile } from '@nestjs/common';
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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

  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['findAll', 'findAllUnits', 'remove', 'patch', 'create', 'findOnesAdmins', 'patchOnesAdmins'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', AdminWorkspaceGroupController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );

  it.each(['findOne', 'findOnesWorkspaces', 'findWorkspaceGroupUnits', 'findWorkspaceGroupUnitItems'] as const)(
    'should let only admins of the group reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', AdminWorkspaceGroupController.prototype[method]))
        .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    }
  );

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
});
