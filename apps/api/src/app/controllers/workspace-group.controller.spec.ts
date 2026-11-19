import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceGroupController } from './workspace-group.controller';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { WorkspaceGroupAccessGuard } from '../guards/workspace-group-access.guard';
import { WorkspaceReportClass } from '../classes/workspace-report.class';
import { UnitItemService } from '../services/unit-item.service';
import { UsersService } from '../services/users.service';
import { IsAdminGuard } from '../guards/is-admin.guard';

describe('WorkspaceGroupController', () => {
  let controller: WorkspaceGroupController;
  let workspaceService: WorkspaceService;
  let unitService: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupController],
      providers: [
        { provide: WorkspaceGroupService, useValue: createMock<WorkspaceGroupService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: UnitService, useValue: createMock<UnitService>() },
        { provide: UnitItemService, useValue: createMock<UnitItemService>() },
        { provide: UsersService, useValue: createMock<UsersService>() }
      ]
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(IsWorkspaceGroupAdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGroupAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(IsAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceGroupController>(WorkspaceGroupController);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
    unitService = module.get<UnitService>(UnitService);
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['patch', 'createWorkspace', 'findWorkspaces', 'findUnits', 'findUnitItems', 'findReport'] as const)(
    'should let only admins of the group reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', WorkspaceGroupController.prototype[method]))
        .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    }
  );

  // Who administers a group is an administrator's to say, not the group admin's.
  it.each(['findAdmins', 'patchAdmins'] as const)('should let only administrators reach %s', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceGroupController.prototype[method]))
      .toEqual([JwtAuthGuard, IsAdminGuard]);
  });

  // The group is the one in the path, which the guard has checked; it used to be read from the body,
  // where the guard does not look (#1005, #1216). Nothing else of the body goes in (#2029).
  it('should create the workspace in the group of the path, with the name alone', async () => {
    jest.spyOn(workspaceService, 'create').mockResolvedValue(42);
    const body = { name: 'Neu', groupId: 9, id: 3 } as { name: string };

    expect(await controller.createWorkspace(2, body)).toBe(42);
    expect(workspaceService.create).toHaveBeenCalledWith({ groupId: 2, name: 'Neu' });
  });

  // The route asked for nothing but a valid token until #1712: any user could read any group.
  it('should let the members of the group read it', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceGroupController.prototype.findOne))
      .toEqual([JwtAuthGuard, WorkspaceGroupAccessGuard]);
  });

  it('should report over the workspaces of the group in the path (#2181)', async () => {
    jest.spyOn(WorkspaceReportClass, 'build').mockResolvedValue([]);

    expect(await controller.findReport(2)).toEqual([]);
    expect(WorkspaceReportClass.build).toHaveBeenCalledWith(workspaceService, unitService, 2);
  });
});
